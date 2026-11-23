// feature/vehciles/use-ai-tank-runtime.ts
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Weapon } from "@/lib/weapons/weapon.timer";
import { WeaponBloomSystem } from "@/lib/weapons/weapon.bloom";
import { WEAPONS } from "@/lib/weapons/weapon.config";
import type { WeaponId } from "@/lib/weapons/weapon.types";
import { TANK_CONFIG } from "@/lib/tanks/tanks.config";
import type { FormationState } from "@/lib/tanks/tanks.types";
import type {
  Obstacle,
  TankLeader,
  TankThreat,
} from "@/lib/movement/movement.types";
import { createTankBody } from "@/lib/movement/movement.body";
import { MOVEMENT_CONFIG } from "@/lib/movement/movement.config";
import {
  DefaultOrderResolver,
  nearestThreatDistance,
} from "@/lib/movement/movement.resolver";
import { DefaultWeaponExecutor } from "@/lib/weapons/weapon.executor";
import { AutoAimingStrategy } from "@/lib/weapons/aim/auto-aiming.strategy";
import {
  createDecision,
  resetDecision,
  type WorldMovement,
} from "@/lib/movement/movement.types";
import { buildUtilityTankTree } from "@/lib/tanks/tanks.trees";
import { LeaderTracker } from "@/lib/tanks/tanks.leader";
import type { Team } from "@/lib/combat/combat.types";
import {
  getVehicleDamageEffects,
  type VehicleDamageEffects,
} from "@/lib/combat/combat.parts";
import type { VehiclePartHealth } from "@/context/vehicle-context";
import { useArena } from "@/context/arena-context";

type UseAITankRuntimeParams = {
  unitId: string;
  initialPosition: [number, number];
  initialRotationY?: number;
  team: Team;
  obstacles: readonly Obstacle[];
  weaponId: WeaponId;
  health?: number;
  maxHealth: number;
  partHealth?: VehiclePartHealth;
  retreatOnDamage: boolean;
  fireWhileMoving: boolean;
  onShoot?: (
    position: THREE.Vector3,
    heading: number,
    pitch: number,
    spread: number,
    weapon: WeaponId,
  ) => void;
};

export function useAITankRuntime({
  unitId,
  initialPosition,
  team,
  obstacles,
  weaponId,
  health,
  maxHealth,
  partHealth,
  retreatOnDamage,
  fireWhileMoving,
  onShoot,
}: UseAITankRuntimeParams) {
  const groupRef = useRef<THREE.Group>(null);
  const arena = useArena();

  const world = useRef<WorldMovement & { terrain: typeof arena.terrain }>({
    terrain: arena.terrain,
    bound: arena.bound,
    obstacles,
  });

  const [body] = useState(() =>
    createTankBody(
      new THREE.Vector3(initialPosition[0], 0, initialPosition[1]),
      0,
      world.current,
    ),
  );

  const damageEffects: VehicleDamageEffects = useMemo(
    () => getVehicleDamageEffects(partHealth, maxHealth),
    [partHealth, maxHealth],
  );

  useEffect(() => {
    body.setDamageModifiers({
      maxSpeedFactor: damageEffects.maxSpeedFactor,
      accelerationFactor: damageEffects.accelerationFactor,
      turnRateFactor: damageEffects.turnRateFactor,
      tractionFactor: damageEffects.tractionFactor,
    });
  }, [body, damageEffects]);

  const resolver = useMemo(() => new DefaultOrderResolver(), []);
  const weaponConfig = WEAPONS[weaponId];
  const weapon = useMemo(
    () => new Weapon(weaponConfig.cooldown),
    [weaponConfig],
  );
  const bloom = useRef(new WeaponBloomSystem());
  const weaponExecutor = useMemo(
    () =>
      new DefaultWeaponExecutor(
        weapon,
        {
          range: weaponConfig.engagementRange,
          alignmentToleranceRad: TANK_CONFIG.combat.defaultMaxAngleOffsetRad,
        },
        new AutoAimingStrategy(),
      ),
    [weapon, weaponConfig],
  );

  const previousHealth = useRef(health);
  const retreatTimer = useRef(0);
  const retreatActive = useRef(false);
  const decision = useRef(createDecision());
  const [home] = useState(
    () => new THREE.Vector3(initialPosition[0], 0, initialPosition[1]),
  );

  const leaderState = useRef<TankLeader & { position: THREE.Vector3 }>({
    position: new THREE.Vector3(),
    heading: MOVEMENT_CONFIG.follow.fallbackLeaderHeading,
  });
  const leaderTracker = useRef(
    new LeaderTracker(MOVEMENT_CONFIG.follow.fallbackLeaderHeading),
  );
  const formationState = useRef<FormationState>({ standby: false });

  // One utility tree per tank: its selector memory and stateful children
  // (patrol goal, flank orbit) must not be shared between vehicles.
  const tree = useMemo(() => buildUtilityTankTree(unitId), [unitId]);

  useEffect(() => {
    if (health === undefined) return;
    if (
      previousHealth.current !== undefined &&
      health < previousHealth.current &&
      health / maxHealth <= TANK_CONFIG.combat.lowHealthRetreatFraction
    ) {
      retreatTimer.current = TANK_CONFIG.combat.retreatMaxDuration;
    }
    previousHealth.current = health;
  }, [health]);

  return {
    groupRef,
    body,
    damageEffects,
    resolver,
    weaponExecutor,
    bloom,
    decision,
    tree,
    world,
    home,
    leaderState,
    leaderTracker,
    formationState,
    retreatTimer,
    retreatActive,
    previousHealth,
  };
}
