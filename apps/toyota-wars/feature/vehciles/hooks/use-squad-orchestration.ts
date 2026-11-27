// apps/toyota-wars/feature/vehciles/hooks/use-squad-orchestration.ts
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useGameFrame } from "@/render-loop";
import {
  COMBAT_CONFIG,
  opposingTeam,
  type HealthMap,
  type Team,
} from "@toyota/combat";
import type { Obstacle } from "@/lib/movement/movement.types";
import type { SquadDirectiveView } from "@toyota/missions";
import { SQUAD_CONFIG } from "@/lib/squad/squad.config";
import { adaptDirectiveView } from "@/lib/squad/squad.directive-adapter";
import {
  EnemySquadTactics,
  type EnemyTacticsMember,
} from "@/lib/squad/enemy-squad-tactics";
import { applyFireDesignation } from "@/lib/squad/squad.designation";
import { pickDirective } from "@/lib/squad/squad.directive-select";
import { applyForcedIntents } from "@/lib/squad/squad.forced-intents";
import { SquadOrchestrator } from "@/lib/squad/squad.orchestrator";
import type { Unit, UnitRegistry } from "@/lib/squad/squad.registry";
import type { RosterUnit } from "@/lib/squad/squad.roster";
import { computeSquadSituational } from "@/lib/squad/squad.situational";
import { createTargetAllocator } from "@/lib/squad/squad.targets";
import {
  ALLY_ATTACK_MODE,
  SQUAD_DIRECTIVE,
  type SquadOrderContext,
} from "@/lib/squad/squad.types";
import { AgentIntent } from "@toyota/agents";
import type { VehicleLoadout } from "@/lib/vehicles/vehicle.types";
import type { SquadShared } from "../../squad/components/squad-vehicles";

type UseSquadOrchestrationParams = {
  team: Team;
  units: readonly RosterUnit[];
  health: HealthMap;
  loadouts: Record<string, VehicleLoadout>;
  registry: UnitRegistry;
  registeredUnits: readonly Unit[];
  directiveView: SquadDirectiveView | null;
  shared: SquadShared | undefined;
  leaderId: string | null;
  getPlayerAggro: (id: string) => number;
};

export function useSquadOrchestration({
  team,
  units,
  health,
  loadouts,
  registry,
  registeredUnits,
  directiveView,
  shared,
  leaderId,
  getPlayerAggro,
}: UseSquadOrchestrationParams) {
  const targetPositionsRef = useRef<Map<string, THREE.Vector3>>(new Map());
  const squadOrdersRef = useRef<Map<string, SquadOrderContext>>(new Map());
  const tacticalElapsedMsRef = useRef(0);

  const tactics = useMemo(() => new EnemySquadTactics(), []);
  const allocateTargets = useMemo(() => createTargetAllocator(), []);
  const orchestrator = useMemo(
    () => new SquadOrchestrator(registry, team, allocateTargets),
    [registry, team, allocateTargets],
  );

  const opposing = opposingTeam(team);
  const enemyTargets = useMemo(
    () =>
      registeredUnits
        .filter((unit) => unit.team === opposing)
        .map((unit) => ({ id: unit.id, position: unit.position })),
    [registeredUnits, opposing],
  );

  useGameFrame((_state, delta) => {
    if (team === "enemy") {
      const elapsedMs =
        tacticalElapsedMsRef.current + Math.max(0, delta) * 1000;
      if (elapsedMs >= SQUAD_CONFIG.enemyTactics.intervalMs) {
        tacticalElapsedMsRef.current =
          elapsedMs % SQUAD_CONFIG.enemyTactics.intervalMs;
        const members: EnemyTacticsMember[] = [];
        for (const unit of units) {
          const currentHealth = health[unit.id] ?? unit.maxHealth;
          if (currentHealth <= 0) continue;
          const position = registry.get(unit.id)?.position;
          if (!position) continue;
          members.push({
            id: unit.id,
            position,
            health: currentHealth / Math.max(1, unit.maxHealth),
          });
        }
        const obstacles: readonly Obstacle[] = shared?.obstacles ?? [];
        tactics.evaluate({
          members,
          targetPositions: targetPositionsRef.current,
          obstacles,
          bound: shared?.bound ?? 0,
        });
      } else {
        tacticalElapsedMsRef.current = elapsedMs;
      }
    }

    const rallySource =
      shared?.leader?.position ??
      (leaderId !== null ? registry.get(leaderId)?.position : undefined);
    const rallyPoint = new THREE.Vector3();
    if (rallySource) {
      rallyPoint.set(rallySource.x, rallySource.y, rallySource.z);
    } else {
      const spawn = units[0]?.spawn;
      rallyPoint.set(spawn?.position[0] ?? 0, 0, spawn?.position[1] ?? 0);
    }

    const situational = computeSquadSituational({
      team,
      opposing,
      units,
      health,
      registry,
      enemyTargets,
      rallyPoint,
      getPlayerAggro,
    });

    let strategic = adaptDirectiveView(directiveView, situational.squadCenter);
    if (
      team === "enemy" &&
      strategic.directive === null &&
      situational.threatPoint
    ) {
      strategic = {
        directive: SQUAD_DIRECTIVE.ADVANCE,
        objectiveTarget: situational.threatPoint,
        targetStopDistance: 0,
        targetIsObjective: false,
      };
    }
    const holdingPosition = team === "ally" && shared?.holdPosition === true;
    if (holdingPosition) {
      strategic = { directive: null, objectiveTarget: null };
    }
    const hasMissionDirective = holdingPosition
      ? false
      : strategic.directive !== null;

    const directive = pickDirective({
      team,
      shared,
      strategic: strategic.directive,
      hasMissionDirective,
    });
    const effectiveDirective =
      team === "enemy" &&
      !situational.retreatAllowed &&
      (directive === SQUAD_DIRECTIVE.GENERAL_RETREAT ||
        directive === SQUAD_DIRECTIVE.FIGHTING_RETREAT)
        ? (strategic.directive ?? SQUAD_DIRECTIVE.HOLD)
        : directive;
    const attackOrder = shared?.attackOrder ?? null;
    const focusTargetId =
      attackOrder?.mode === ALLY_ATTACK_MODE.FOCUS
        ? attackOrder.targetId
        : undefined;
    const attackOrderActive =
      attackOrder !== null &&
      effectiveDirective !== SQUAD_DIRECTIVE.GENERAL_RETREAT;
    const allyAttackPriorityIds =
      team === "ally" && focusTargetId
        ? new Set(units.map((unit) => unit.id))
        : situational.priorityMemberIds;

    orchestrator.update(
      enemyTargets,
      health,
      loadouts,
      targetPositionsRef.current,
      squadOrdersRef.current,
      {
        directive: effectiveDirective,
        retreatAllowed: situational.retreatAllowed,
        isExplicitOrder: shared?.isExplicitOrder ?? false,
        rallyPoint,
        objectiveTarget: attackOrderActive ? null : strategic.objectiveTarget,
        targetStopDistance: attackOrderActive
          ? undefined
          : strategic.targetStopDistance,
        targetIsObjective: attackOrderActive
          ? false
          : strategic.targetIsObjective,
        holdPosition: holdingPosition && attackOrder === null,
        forcedIntent: attackOrderActive ? AgentIntent.Attack : undefined,
        attackOrder: attackOrderActive ? attackOrder : null,
        priorityTargetId:
          team === "enemy"
            ? enemyTargets.find((t) => t.id === COMBAT_CONFIG.PLAYER_ID)?.id
            : focusTargetId,
        priorityMemberIds: allyAttackPriorityIds,
      },
    );

    if (team === "enemy" && !shared?.holdFormation) {
      tactics.apply(squadOrdersRef.current);
    }

    applyFireDesignation({
      designation: shared?.fireDesignation,
      team,
      units,
      health,
      loadouts,
      registry,
      orders: squadOrdersRef.current,
      leaderPosition: shared?.leader?.position,
      attackIntent: AgentIntent.Attack,
    });

    applyForcedIntents(squadOrdersRef.current, situational, {
      retreat: AgentIntent.Retreat,
      attack: AgentIntent.Attack,
    });

    if (shared?.holdFormation && leaderId) {
      for (const [id, order] of squadOrdersRef.current) {
        if (id !== leaderId) order.forcedIntent = AgentIntent.FollowLeader;
      }
    }
  }, "squadCommand");

  return {
    targetPositionsRef,
    squadOrdersRef,
  };
}
