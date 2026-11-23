// apps/toyota-wars/lib/meso/meso.evaluator.ts
import { SQUAD_DIRECTIVE, SquadDirective } from "@/lib/squad/squad.types";
import { MESO_CONFIG } from "./meso.config";
import {
  FIRETEAM_TACTIC,
  type FireteamContext,
  type FireteamTactic,
} from "./meso.types";

export class MesoEvaluator {
  /**
   * Evaluates local fireteam telemetry and determines whether macro directives
   * should be locally overridden (e.g., turning a general retreat into a counter-ambush).
   */
  public evaluateTacticalAdaptation(context: FireteamContext): {
    adaptedDirective: SquadDirective;
    fireteamTactic: FireteamTactic;
  } {
    const {
      macroDirective,
      localAlliesCount,
      localEnemiesCount,
      avgHealth,
      closestEnemyDistance,
    } = context;

    // 1. Check for Counter-Ambush Condition during Retreat
    if (
      macroDirective === SQUAD_DIRECTIVE.GENERAL_RETREAT ||
      macroDirective === SQUAD_DIRECTIVE.FIGHTING_RETREAT
    ) {
      const superiorityRatio =
        localAlliesCount / Math.max(1, localEnemiesCount);

      // If pursuers are close, we have enough local strength, and health isn't critically wiped out:
      if (
        closestEnemyDistance <= MESO_CONFIG.localAwarenessRadius &&
        superiorityRatio >= MESO_CONFIG.counterAmbushSuperiorityRatio &&
        avgHealth >= MESO_CONFIG.minHealthForCounterAttack
      ) {
        // REVERSE RETREAT -> COUNTER-AMBUSH
        return {
          adaptedDirective: SQUAD_DIRECTIVE.ADVANCE,
          fireteamTactic: FIRETEAM_TACTIC.COUNTER_AMBUSH,
        };
      }
    }

    // 2. Default mapping based on macro directive
    switch (macroDirective) {
      case SQUAD_DIRECTIVE.FLANK:
        return {
          adaptedDirective: macroDirective,
          fireteamTactic: FIRETEAM_TACTIC.FLANK_HOOK,
        };
      case SQUAD_DIRECTIVE.ADVANCE:
        return {
          adaptedDirective: macroDirective,
          fireteamTactic: FIRETEAM_TACTIC.SUPPRESS_ANVIL,
        };
      case SQUAD_DIRECTIVE.FIGHTING_RETREAT:
      case SQUAD_DIRECTIVE.GENERAL_RETREAT:
        return {
          adaptedDirective: macroDirective,
          fireteamTactic: FIRETEAM_TACTIC.BOUNDING_RETREAT,
        };
      default:
        return {
          adaptedDirective: macroDirective,
          fireteamTactic: FIRETEAM_TACTIC.HOLD_FORMATION,
        };
    }
  }
}
