import { getFormationOffset } from "@/lib/tactics/tactics.formation"; // keep import for callers that rely on it indirectly?
import type { FireteamTactic } from "../meso/meso.types";
import { SQUAD_CONFIG } from "./squad.config";
import {
  SQUAD_DIRECTIVE,
  type AllyAttackOrder,
  type Point2D,
  type SquadDirective,
  type SquadMemberTelemetry,
  type SquadOrderContext,
} from "./squad.types";
import type { AgentIntentId } from "@toyota/agents";
import { getDirectiveStrategy } from "@/lib/squad/directives/strategy";
import { buildDirectiveContext } from "./directives/common";

export interface EvaluateSquadParams {
  members: SquadMemberTelemetry[];
  currentDirective: SquadDirective;
  fireteamTactic: FireteamTactic;
  targetPosition: Point2D | null;
  targetStopDistance?: number;
  targetIsObjective?: boolean;
  rallyPoint: Point2D;
  isExplicitOrder: boolean;
  forcedIntent?: AgentIntentId;
  attackOrder?: AllyAttackOrder | null;
  retreatAllowed: boolean;
  spacing?: number;
}

export class SquadManager {
  public evaluateSquad(
    params: EvaluateSquadParams,
  ): Map<string, SquadOrderContext> {
    const { members, spacing = 8 } = params;
    if (members.length === 0) return new Map();

    const directive = this.resolveDirective(params);
    const assignments = getDirectiveStrategy(directive).assign(
      buildDirectiveContext(members, spacing),
    );

    const retreatingRatio =
      members.filter((m) => m.isRetreating).length / members.length;

    const results = new Map<string, SquadOrderContext>();
    for (const member of members) {
      const assigned = assignments.get(member.id);
      if (!assigned) continue;
      results.set(member.id, {
        directive,
        fireteamTactic: params.fireteamTactic,
        assignedRole: assigned.role,
        formationType: assigned.formationType,
        formationOffset: assigned.formationOffset,
        subGroupLeaderId: assigned.subGroupLeaderId,
        useOrbitTactic: assigned.useOrbitTactic,
        targetPosition: params.targetPosition,
        targetStopDistance: params.targetStopDistance,
        targetIsObjective: params.targetIsObjective,
        rallyPoint: params.rallyPoint,
        isExplicitOrder: params.isExplicitOrder,
        forcedIntent: params.forcedIntent,
        attackOrder: params.attackOrder,
        retreatingRatio,
        retreatAllowed: params.retreatAllowed,
      });
    }
    return results;
  }

  /** Squad-wide retreat escalation — sits above individual strategies. */
  private resolveDirective(params: EvaluateSquadParams): SquadDirective {
    const { members, currentDirective } = params;
    const retreatingRatio =
      members.filter((m) => m.isRetreating).length / members.length;
    const avgHealth =
      members.reduce((sum, m) => sum + m.health, 0) / members.length;

    if (
      params.retreatAllowed &&
      (retreatingRatio >= SQUAD_CONFIG.generalRetreatThreshold ||
        avgHealth <= SQUAD_CONFIG.criticalSquadHealthThreshold)
    ) {
      return SQUAD_DIRECTIVE.GENERAL_RETREAT;
    }
    return currentDirective;
  }
}
