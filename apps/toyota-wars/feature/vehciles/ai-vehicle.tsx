// feature/vehciles/ai-vehicle.tsx
"use client";

import React, { useMemo, useRef } from "react";
import { fireRangeForOrder, resetAgentDecision } from "@toyota/agents";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { AGENT_CONFIG, TANK_CONFIG } from "@/lib/agents/agent-runtime.config";
import {
  COMBAT_CONFIG,
  calculatePredictedIntercept,
  findBlockingObstacle,
  hasAssignedTarget,
  isCombatActive,
  readMuzzleTransform,
  WEAPONS,
  type FireRequest,
  type WeaponId,
} from "@toyota/combat";
import { MOVEMENT_CONFIG } from "@/lib/movement/movement.config";
import {
  IDLE_DRIVE,
  MovementOrders,
  type Obstacle,
  type TankLeader,
  type TankThreat,
} from "@/lib/movement/movement.types";
import { nearestThreatDistance } from "@/lib/movement/movement.resolver";
import { mapAgentDecision } from "@/lib/agents/agent-decision";
import { useBattle, useRegisterUnit } from "@/context/battle-context";
import { useAITankRuntime } from "@/hooks/use-ai-tank-runtime";
import {
  resolveVehicleLoadout,
  VEHICLE_PLATFORMS,
} from "@/lib/vehicles/vehicle.config";
import {
  sampleChassisTerrain,
  updateChassisPose,
  type ChassisPose,
} from "@/lib/vehicles/vehicle.grounding";
import {
  updateVehicleMotion,
  type VehicleMotion,
} from "@/lib/vehicles/vehicle.motion";
import { useArena } from "@/context/arena-context";
import { useSquadContext } from "@/context/squad-context";
import {
  SQUAD_DIRECTIVE,
  type SquadOrderContext,
} from "@/lib/squad/squad.types";
import { FIRETEAM_TACTIC } from "@toyota/ai";
import type { VehiclePartHealth } from "./components/vehicle";
import type { VehicleSpawn } from "@/lib/map/map.types";
import { VehicleVisuals } from "./components/vehicle-visuals";
import { useAITankControl } from "./hooks/use-ai-tank-control";
import {
  createRecoilState,
  kickRecoil,
} from "@/feature/vehciles/hooks/use-wreck-visual";

type AIVehicleProps = {
  unitId: string;
  spawn: VehicleSpawn;
  targetPosition?: THREE.Vector3 | null;
  leader?: TankLeader | null;
  isSquadLeader?: boolean;
  health?: number;
  maxHealth?: number;
  partHealth?: VehiclePartHealth;
  destroyed?: boolean;
  routed?: boolean;
  radius?: number;
  fireWhileMoving?: boolean;
  onShoot?: (
    position: THREE.Vector3,
    heading: number,
    pitch: number,
    spread: number,
    weapon: WeaponId,
    worldMuzzle?: FireRequest["worldMuzzle"],
    barrel?: number,
  ) => void;
  children?: React.ReactNode;
};

const NO_OFFSET: [number, number] = [0, 0];

// Neutral order used until the squad orchestrator publishes one for this unit.
const NO_SQUAD_ORDER: SquadOrderContext = {
  directive: SQUAD_DIRECTIVE.HOLD,
  fireteamTactic: FIRETEAM_TACTIC.HOLD_FORMATION,
  assignedRole: "support",
  formationType: "line",
  formationOffset: NO_OFFSET,
  subGroupLeaderId: null,
  useOrbitTactic: false,
  targetPosition: null,
  holdPosition: false,
  rallyPoint: { x: 0, y: 0 },
  isExplicitOrder: false,
  retreatingRatio: 0,
  retreatAllowed: false,
};

export function AIVehicle({
  unitId,
  spawn,
  targetPosition = null,
  leader = null,
  isSquadLeader = false,
  health,
  maxHealth = COMBAT_CONFIG.MAX_HEALTH,
  partHealth,
  destroyed = false,
  routed = false,
  radius = MOVEMENT_CONFIG.body.radius,
  fireWhileMoving = false,
  onShoot,
  children,
}: AIVehicleProps) {
  const {
    team,
    obstacles,
    targetPositionsRef,
    squadOrdersRef,
    retreatOnDamage,
  } = useSquadContext();
  const {
    position: initialPosition,
    rotationY: initialRotationY,
    palette,
    formationOffset = NO_OFFSET,
  } = spawn;
  const loadout = useMemo(
    () => resolveVehicleLoadout(spawn),
    [spawn.model, spawn.weapon, spawn.platform],
  );
  const weapon = WEAPONS[loadout.weapon];
  const vehicle = VEHICLE_PLATFORMS[loadout.platform];
  const visualRef = useRef<THREE.Group>(null);
  const pose = useRef<ChassisPose>({ pitch: 0, roll: 0 });
  const muzzleRef = useRef<THREE.Object3D>(null);
  const recoilRef = useRef(createRecoilState());
  const nextBarrelRef = useRef(0);
  const muzzleWorld = useRef(new THREE.Vector3());
  const muzzleDirection = useRef(new THREE.Vector3());
  const aimAlignedRef = useRef(false);
  const aimTargetRef = useRef<THREE.Vector3 | null>(targetPosition);
  const externalTargetRef = useRef<THREE.Vector3 | null>(
    targetPosition ?? null,
  );
  const lastKnownPositionRef = useRef(new THREE.Vector3());
  const hasLastKnownPositionRef = useRef(false);
  const lineOfSightClearRef = useRef(true);
  const blockingObstacleRef = useRef<Obstacle | null>(null);
  const muzzleReadyRef = useRef(false);
  const orderTarget = useRef(new THREE.Vector3());
  const designationTarget = useRef(new THREE.Vector3());
  const targetVelocity = useRef(new THREE.Vector3());
  const aimPoint = useRef(new THREE.Vector3());
  const motion = useRef<VehicleMotion>({ speed: 0, steer: 0 });
  const ammo = useRef<number>(Number.POSITIVE_INFINITY);
  const { registry, wrecks } = useBattle();
  const arena = useArena();

  const runtime = useAITankRuntime({
    unitId,
    initialPosition,
    initialRotationY,
    team,
    obstacles,
    weaponId: weapon.id,
    health,
    maxHealth,
    partHealth,
    retreatOnDamage,
    fireWhileMoving,
    onShoot,
  });
  const prevHeading = useRef(runtime.body.heading);
  const initialY = arena.terrain.getVehicleHeight(
    initialPosition[0],
    initialPosition[1],
  );

  const { rigidBodyRef, registryPosition, bodyAdapter } = useAITankControl({
    unitId,
    team,
    destroyed,
    initialPosition,
    runtime,
    terrain: arena.terrain,
    wrecks,
  });

  useRegisterUnit(
    {
      id: unitId,
      team,
      kind: "tank",
      radius,
      ai: true,
      loadout,
      body: bodyAdapter,
      nudge: bodyAdapter.nudge,
    },
    !destroyed,
  );

  useFrame((_, delta) => {
    if (destroyed) return;
    const rb = rigidBodyRef.current;
    if (!rb) return;

    const squadOrder = squadOrdersRef?.current.get(unitId) ?? NO_SQUAD_ORDER;
    const designation = squadOrder.fireDesignation;
    const designationActive = Boolean(
      designation && designation.expiresAt > performance.now(),
    );
    let externalTarget: THREE.Vector3 | null = null;
    let usingObjectiveTarget = false;
    if (designation && designationActive) {
      const tracked = designation.targetId
        ? registry.get(designation.targetId)
        : undefined;
      if (tracked) {
        designationTarget.current.copy(tracked.position);
      } else {
        designationTarget.current.set(
          designation.point.x,
          arena.terrain.getHeight(designation.point.x, designation.point.z),
          designation.point.z,
        );
      }
      externalTarget = designationTarget.current;
    }
    if (!externalTarget) {
      externalTarget =
        targetPositionsRef?.current?.get(unitId) ?? targetPosition ?? null;
      if (
        !externalTarget &&
        squadOrder.directive === SQUAD_DIRECTIVE.ADVANCE &&
        squadOrder.targetPosition
      ) {
        const { x, y } = squadOrder.targetPosition;
        orderTarget.current.set(x, arena.terrain.getHeight(x, y), y);
        externalTarget = orderTarget.current;
        usingObjectiveTarget = true;
      }
    }
    const trackedTarget = usingObjectiveTarget ? null : externalTarget;
    const weaponOrigin = muzzleReadyRef.current
      ? muzzleWorld.current
      : runtime.body.position;
    const blockingObstacle = trackedTarget
      ? findBlockingObstacle(weaponOrigin, trackedTarget, obstacles)
      : null;
    const lineOfSightClear = blockingObstacle === null;
    lineOfSightClearRef.current = lineOfSightClear;
    blockingObstacleRef.current = blockingObstacle;
    if (trackedTarget) {
      if (lineOfSightClear || !hasLastKnownPositionRef.current) {
        lastKnownPositionRef.current.copy(trackedTarget);
        hasLastKnownPositionRef.current = true;
      } else {
        externalTarget = lastKnownPositionRef.current;
      }
    } else if (!externalTarget && hasLastKnownPositionRef.current) {
      externalTarget = lastKnownPositionRef.current;
    }
    const effectiveSquadOrder: SquadOrderContext = usingObjectiveTarget
      ? squadOrder
      : {
          ...squadOrder,
          fireDesignation: designationActive ? designation : undefined,
          targetIsObjective: false,
          targetStopDistance: undefined,
        };
    runtime.weaponExecutor.setRange(
      fireRangeForOrder(
        weapon,
        AGENT_CONFIG,
        effectiveSquadOrder.attackOrder,
        effectiveSquadOrder.fireDesignation,
      ),
    );

    let targetUnitId: string | null = null;
    if (designationActive && designation?.targetId) {
      targetUnitId = designation.targetId;
    } else if (trackedTarget && targetPositionsRef?.current) {
      for (const [id, position] of targetPositionsRef.current) {
        if (position === externalTarget) {
          targetUnitId = id;
          break;
        }
      }
    }
    const targetUnit = targetUnitId ? registry.get(targetUnitId) : undefined;
    if (targetUnit) {
      targetVelocity.current.set(
        Math.sin(targetUnit.body.heading) * targetUnit.body.speed,
        0,
        Math.cos(targetUnit.body.heading) * targetUnit.body.speed,
      );
    } else {
      targetVelocity.current.set(0, 0, 0);
    }
    const aimTarget = externalTarget
      ? calculatePredictedIntercept(
          weaponOrigin,
          externalTarget,
          targetVelocity.current,
          weapon.projectile.speed,
          aimPoint.current,
          weapon.projectile.gravity,
          3,
        )
      : null;
    aimTargetRef.current = aimTarget;
    externalTargetRef.current = aimTarget;

    const targetDistance = externalTarget
      ? Math.hypot(
          runtime.body.position.x - externalTarget.x,
          runtime.body.position.z - externalTarget.z,
        )
      : Infinity;
    const liveTarget =
      !usingObjectiveTarget &&
      trackedTarget !== null &&
      lineOfSightClear &&
      targetDistance <= runtime.weaponExecutor.getRange();
    const scriptedMovement =
      usingObjectiveTarget || squadOrder.targetIsObjective === true;
    const combatActive =
      designationActive ||
      liveTarget ||
      isCombatActive(COMBAT_CONFIG.COMBAT_ACTIVITY_WINDOW_MS);

    if (leader) {
      runtime.leaderTracker.current.update(
        leader.position,
        delta,
        leader.heading,
      );
      runtime.leaderState.current.position.copy(leader.position);
      runtime.leaderState.current.heading =
        runtime.leaderTracker.current.heading;
      runtime.leaderState.current.speed = leader.speed;
    }
    runtime.world.current.obstacles = obstacles;
    runtime.weaponExecutor.tick(delta);

    const threats: readonly TankThreat[] = registry.byTeam(
      team === "ally" ? "enemy" : "ally",
    );

    if (runtime.retreatTimer.current > 0) {
      runtime.retreatTimer.current = Math.max(
        0,
        runtime.retreatTimer.current - delta,
      );
    }
    if (
      retreatOnDamage &&
      runtime.retreatTimer.current > 0 &&
      nearestThreatDistance(runtime.body.position, threats) >=
        TANK_CONFIG.combat.retreatSafeDistance
    ) {
      runtime.retreatTimer.current = 0;
    }
    runtime.retreatActive.current =
      retreatOnDamage && runtime.retreatTimer.current > 0;

    resetAgentDecision(runtime.agentDecision.current);
    runtime.tree.evaluate({
      unitId,
      position: runtime.body.position,
      heading: runtime.body.heading,
      speed: runtime.body.speed,
      delta,
      targetPosition: externalTarget,
      hasAssignedTarget: hasAssignedTarget(externalTarget),
      lastKnownPosition: hasLastKnownPositionRef.current
        ? lastKnownPositionRef.current
        : null,
      blockingObstacle: blockingObstacleRef.current,
      lineOfSightClear,
      weaponOrigin,
      obstacles,
      leader: leader ? runtime.leaderState.current : null,
      isSquadLeader,
      formationOffset,
      canFire: runtime.weaponExecutor.ready && ammo.current >= weapon.ammoCost,
      decision: runtime.agentDecision.current,
      formationState: runtime.formationState.current,
      home: runtime.home,
      threats,
      retreatActive: runtime.retreatActive.current,
      routed,
      canFireWhileMoving: fireWhileMoving,
      health: Math.min(
        1,
        Math.max(
          0,
          (health ?? COMBAT_CONFIG.MAX_HEALTH) / COMBAT_CONFIG.MAX_HEALTH,
        ),
      ),
      targetDistance,
      enemiesNearby: threats.length,
      alliesNearby: Math.max(0, registry.byTeam(team).length - 1),
      leaderDistance: leader
        ? runtime.body.position.distanceTo(leader.position)
        : Infinity,
      vehicle,
      weapon,
      bound: arena.bound,
      squadOrder: effectiveSquadOrder,
      damagedNeighborsCount: 0,
      retreatingNeighborsCount: 0,
      config: AGENT_CONFIG,
      ports: runtime.agentPorts,
    });
    runtime.decision.current = mapAgentDecision(runtime.agentDecision.current);

    const holdingStation =
      squadOrder.holdPosition === true &&
      squadOrder.attackOrder == null &&
      !scriptedMovement &&
      !runtime.retreatActive.current;
    if (holdingStation) {
      const homeDistance = runtime.body.position.distanceTo(runtime.home);
      runtime.decision.current.movement =
        homeDistance > AGENT_CONFIG.patrolArriveRadius
          ? {
              type: MovementOrders.MoveTo,
              point: runtime.home,
              speed: AGENT_CONFIG.patrolSpeed,
              stopDistance: AGENT_CONFIG.patrolArriveRadius,
              slowRadius: AGENT_CONFIG.followSlowRadius,
            }
          : { type: MovementOrders.Idle };
    }

    if (!combatActive) {
      aimTargetRef.current = null;
      externalTargetRef.current = null;
      hasLastKnownPositionRef.current = false;
      if (!scriptedMovement) {
        runtime.decision.current.movement = { type: MovementOrders.Idle };
        runtime.decision.current.weapon = { type: "hold" };
      }
    }

    let command = runtime.resolver.resolve(
      runtime.decision.current.movement,
      runtime.body,
      runtime.world.current,
      delta,
    );
    if (!combatActive && Math.abs(command.throttle) <= 0.01) {
      command = IDLE_DRIVE;
    }
    runtime.body.step(command, delta);

    const heading = runtime.body.heading;
    const position = runtime.body.position;
    registryPosition.current.copy(position);

    const terrain = sampleChassisTerrain(
      position.x,
      position.z,
      heading,
      arena.terrain,
    );
    updateChassisPose(pose.current, terrain, delta);

    rb.setTranslation({ x: position.x, y: position.y, z: position.z }, true);

    const rot = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      heading,
    );
    rb.setRotation(rot, true);

    const visual = visualRef.current;
    if (visual) {
      visual.rotation.set(pose.current.pitch, 0, pose.current.roll, "YXZ");
    }

    updateVehicleMotion(motion.current, prevHeading, runtime.body, delta);
  }, -1);

  useFrame((_, delta) => {
    const weaponOrder = runtime.weaponExecutor.resolveOrder(
      runtime.decision.current.weapon,
      runtime.body,
      {
        targetPosition: externalTargetRef.current,
        canFireWhileMoving: fireWhileMoving,
      },
    );
    runtime.bloom.current.update(delta, weaponOrder.type === "fireAt");
    const retreating =
      runtime.retreatActive.current ||
      runtime.decision.current.movement.type === "flee";
    const outOfRange =
      weaponOrder.type === "fireAt" &&
      runtime.body.position.distanceTo(weaponOrder.point) >
        runtime.weaponExecutor.getRange();

    const muzzleReady = readMuzzleTransform(
      muzzleRef.current,
      muzzleWorld.current,
      muzzleDirection.current,
    );
    muzzleReadyRef.current = muzzleReady;
    const target = externalTargetRef.current;
    const blocker =
      target !== null && muzzleReady
        ? findBlockingObstacle(muzzleWorld.current, target, obstacles)
        : null;
    const targetBlocked = blocker !== null;
    blockingObstacleRef.current = blocker;
    lineOfSightClearRef.current = !targetBlocked;

    if (
      weaponOrder.type !== "fireAt" ||
      targetBlocked ||
      runtime.damageEffects.weaponDisabled ||
      ammo.current < weapon.ammoCost ||
      outOfRange ||
      (!retreating && !aimAlignedRef.current) ||
      !muzzleReady
    ) {
      return;
    }

    const fireHeading = runtime.weaponExecutor.execute(
      weaponOrder,
      runtime.body,
    );
    if (fireHeading === null) return;

    ammo.current = Math.max(0, ammo.current - weapon.ammoCost);
    runtime.bloom.current.registerShot();
    const muzzleCount = weapon.muzzles?.length ?? 1;
    const barrel = nextBarrelRef.current % muzzleCount;
    nextBarrelRef.current = (barrel + 1) % muzzleCount;
    kickRecoil(recoilRef, weapon.recoil, barrel);
    const spreadMultiplier = retreating
      ? TANK_CONFIG.combat.retreatSpreadMultiplier
      : 1;
    const shotDistance = Math.max(
      1,
      muzzleWorld.current.distanceTo(weaponOrder.point),
    );
    const precisionSpread = Math.max(
      0.0004,
      (weapon.projectile.hitRadius * 0.75) / shotDistance,
    );
    const rawSpread = runtime.bloom.current.getSpreadAngle(
      runtime.body.speed,
      weapon.spread * spreadMultiplier,
    );
    const spread = retreating
      ? rawSpread
      : Math.min(rawSpread, precisionSpread);
    onShoot?.(
      muzzleWorld.current.clone(),
      fireHeading,
      Math.asin(THREE.MathUtils.clamp(muzzleDirection.current.y, -1, 1)),
      spread,
      weapon.id,
      { position: muzzleWorld.current, direction: muzzleDirection.current },
      barrel,
    );
  });

  const wreckPosition: [number, number, number] = [
    runtime.body.position.x,
    arena.terrain.getVehicleHeight(
      runtime.body.position.x,
      runtime.body.position.z,
    ),
    runtime.body.position.z,
  ];

  return (
    <VehicleVisuals
      unitId={unitId}
      team={team}
      palette={palette}
      model={loadout.model}
      platform={loadout.platform}
      weapon={weapon}
      initialPosition={initialPosition}
      initialY={initialY}
      initialRotationY={initialRotationY}
      wreckPosition={wreckPosition}
      wreckRotationY={runtime.body.heading}
      health={health ?? maxHealth}
      maxHealth={maxHealth}
      partHealth={partHealth}
      destroyed={destroyed}
      rigidBodyRef={rigidBodyRef}
      visualRef={visualRef}
      muzzleRef={muzzleRef}
      recoilRef={recoilRef}
      aimTargetRef={aimTargetRef}
      aimAlignedRef={aimAlignedRef}
      motionRef={motion}
    >
      {children}
    </VehicleVisuals>
  );
}
