import * as THREE from "three";
import { COMBAT_CONFIG } from "@/lib/combat/combat.config";
import type {
  HealthMap,
  PotentialTarget,
  Team,
} from "@/lib/combat/combat.types";
import type { UnitRegistry } from "./squad.registry";
import type { TargetAllocationOptions } from "./squad.targets";
import type {
  AllyAttackOrder,
  SquadDirective,
  SquadMemberTelemetry,
  SquadOrderContext,
} from "./squad.types";
import { SquadManager } from "./squad.core";
import { MESO_CONFIG } from "../meso/meso.config";
import { MesoEvaluator } from "../meso/meso.evaluator";
import {
  DEFAULT_VEHICLE_LOADOUT,
  VEHICLE_PLATFORMS,
} from "../vehicles/vehicle.config";
import type { VehicleLoadout } from "../vehicles/vehicle.types";
import { WEAPONS } from "../weapons/weapon.config";
import type { Vec2 } from "@toyota/missions";
import type { AgentIntentId } from "@toyota/agents";

export interface SquadTickState {
  directive: SquadDirective;
  isExplicitOrder: boolean;
  rallyPoint: THREE.Vector3;
  objectiveTarget?: Vec2 | null;
  targetStopDistance?: number;
  targetIsObjective?: boolean;
  forcedIntent?: AgentIntentId;
  attackOrder?: AllyAttackOrder | null;
  priorityTargetId?: string;
  priorityMemberIds?: ReadonlySet<string>;
  retreatAllowed: boolean;
}

type AllocateTargetsFn = (
  members: { id: string; position: THREE.Vector3 }[],
  targets: PotentialTarget[],
  health: HealthMap,
  options?: TargetAllocationOptions,
) => Record<string, string | undefined>;

export class SquadOrchestrator {
  private readonly tacticalManager = new SquadManager();
  private readonly mesoEvaluator = new MesoEvaluator();
  private readonly retreatingUnits = new Set<string>();

  constructor(
    private readonly registry: UnitRegistry,
    private readonly team: Team,
    private readonly allocateTargets: AllocateTargetsFn,
  ) {}

  public reportUnitRetreating(unitId: string, isRetreating: boolean): void {
    if (isRetreating) this.retreatingUnits.add(unitId);
    else this.retreatingUnits.delete(unitId);
  }

  public update(
    enemyTargets: readonly PotentialTarget[],
    healthMap: HealthMap,
    loadouts: Readonly<Record<string, VehicleLoadout>>,
    targetPositions: Map<string, THREE.Vector3>,
    squadOrders: Map<string, SquadOrderContext>,
    state: SquadTickState,
  ): void {
    const aiUnits = this.registry.aiByTeam(this.team);
    if (aiUnits.length === 0) {
      targetPositions.clear();
      squadOrders.clear();
      return;
    }

    const primaryTargetPos = this.allocate(
      aiUnits,
      enemyTargets,
      healthMap,
      state,
      targetPositions,
    );
    const telemetry = this.buildTelemetry(aiUnits, healthMap, loadouts);
    const mesoResult = this.evaluateMeso(
      telemetry,
      aiUnits,
      enemyTargets,
      state.directive,
    );

    const orders = this.tacticalManager.evaluateSquad({
      members: telemetry,
      currentDirective: mesoResult.adaptedDirective,
      fireteamTactic: mesoResult.fireteamTactic,
      targetPosition: state.objectiveTarget
        ? { x: state.objectiveTarget.x, y: state.objectiveTarget.z }
        : primaryTargetPos
          ? { x: primaryTargetPos.x, y: primaryTargetPos.z }
          : null,
      targetStopDistance: state.objectiveTarget
        ? state.targetStopDistance
        : undefined,
      targetIsObjective: state.objectiveTarget
        ? (state.targetIsObjective ?? true)
        : false,
      rallyPoint: { x: state.rallyPoint.x, y: state.rallyPoint.z },
      isExplicitOrder: state.isExplicitOrder,
      forcedIntent: state.forcedIntent,
      attackOrder: state.attackOrder,
      retreatAllowed: state.retreatAllowed,
    });

    squadOrders.clear();
    for (const [id, order] of orders) squadOrders.set(id, order);
  }

  private allocate(
    aiUnits: ReturnType<UnitRegistry["aiByTeam"]>,
    enemyTargets: readonly PotentialTarget[],
    healthMap: HealthMap,
    state: SquadTickState,
    targetPositions: Map<string, THREE.Vector3>,
  ): THREE.Vector3 | null {
    const members = aiUnits.map((u) => ({ id: u.id, position: u.position }));
    const allocations = this.allocateTargets(
      members,
      [...enemyTargets],
      healthMap,
      {
        priorityTargetId: state.priorityTargetId,
        priorityMemberIds: state.priorityMemberIds,
      },
    );

    let primary: THREE.Vector3 | null = null;
    for (const unit of aiUnits) {
      const targetId = allocations[unit.id];
      const target = targetId
        ? enemyTargets.find((c) => c.id === targetId)
        : undefined;
      if (target) {
        targetPositions.set(unit.id, target.position);
        if (!primary) primary = target.position;
      } else {
        targetPositions.delete(unit.id);
      }
    }
    return primary;
  }

  private buildTelemetry(
    aiUnits: ReturnType<UnitRegistry["aiByTeam"]>,
    healthMap: HealthMap,
    loadouts: Readonly<Record<string, VehicleLoadout>>,
  ): SquadMemberTelemetry[] {
    return aiUnits.map((unit) => {
      const raw = healthMap[unit.id] ?? COMBAT_CONFIG.MAX_HEALTH;
      const loadout = loadouts[unit.id] ?? DEFAULT_VEHICLE_LOADOUT;
      return {
        id: unit.id,
        health: Math.max(0, raw / COMBAT_CONFIG.MAX_HEALTH),
        vehicle: VEHICLE_PLATFORMS[loadout.platform],
        weapon: WEAPONS[loadout.weapon],
        isRetreating: this.retreatingUnits.has(unit.id),
        position: { x: unit.position.x, y: unit.position.z },
      };
    });
  }

  private evaluateMeso(
    telemetry: SquadMemberTelemetry[],
    aiUnits: ReturnType<UnitRegistry["aiByTeam"]>,
    enemyTargets: readonly PotentialTarget[],
    directive: SquadDirective,
  ) {
    const avgHealth =
      telemetry.reduce((s, m) => s + m.health, 0) /
      Math.max(1, telemetry.length);

    let closestEnemyDist = Infinity;
    let localEnemiesCount = 0;
    for (const t of enemyTargets) {
      let nearby = false;
      for (const u of aiUnits) {
        const d = u.position.distanceTo(t.position);
        if (d < closestEnemyDist) closestEnemyDist = d;
        if (d <= MESO_CONFIG.localAwarenessRadius) nearby = true;
      }
      if (nearby) localEnemiesCount += 1;
    }

    return this.mesoEvaluator.evaluateTacticalAdaptation({
      fireteamId: `${this.team}-main-fireteam`,
      macroDirective: directive,
      members: telemetry,
      avgHealth,
      localAlliesCount: telemetry.length,
      localEnemiesCount,
      closestEnemyDistance: closestEnemyDist,
    });
  }
}
