// src/modules/tanks/tanks.utility.ts
import type { UtilityOption } from "@/lib/behavior-tree/utility-selector";
import { TANK_INTENT, TankIntent, TankContext } from "./tanks.types";
import { TANK_CONFIG } from "./tanks.config";

/** Scoring functions that evaluate how appropriate each intent is for a tank given its context */
export const tankOptions: Record<TankIntent, UtilityOption<TankContext, string>> = {
  [TANK_INTENT.ATTACK]: {
    name: "Attack",
    score: (ctx) => {
      if (!ctx.targetId && !ctx.getTargetPosition?.()) return 0;
      if (ctx.isRouted || ctx.isRetreating) return 0;
      // Higher score if healthy and target is in range
      return ctx.health / ctx.maxHealth * 0.8 + 0.2;
    },
  },
  [TANK_INTENT.FLANK]: {
    name: "Flank",
    score: (ctx) => {
      if (!ctx.targetId && !ctx.getTargetPosition?.()) return 0;
      if (ctx.isRouted || ctx.isRetreating) return 0;
      // Flank preference based on tactical situation
      return 0.5;
    },
  },
  [TANK_INTENT.FOLLOW_LEADER]: {
    name: "Follow Leader",
    score: (ctx) => {
      if (!ctx.leaderId || ctx.isRouted) return 0;
      return 0.6;
    },
  },
  [TANK_INTENT.PATROL]: {
    name: "Patrol",
    score: (ctx) => {
      if (ctx.targetId || ctx.leaderId || ctx.isRouted) return 0.1;
      return 0.4; // Default baseline behavior when idle
    },
  },
  [TANK_INTENT.RETREAT]: {
    name: "Retreat",
    score: (ctx) => {
      if (ctx.isRouted || ctx.isRetreating || ctx.health / ctx.maxHealth < 0.25) {
        return 1.0; // Emergency retreat priority
      }
      return 0.0;
    },
  },
};

export function createUtilityDebug(unitId: string) {
  if (!TANK_CONFIG.utility.debug) return undefined;
  return (intent: TankIntent, score: number) => {
    // Server-side logging hook for AI telemetry
    // console.log(`[Tank AI ${unitId}] Intent: ${intent} scored ${score.toFixed(2)}`);
  };
}

export { TANK_INTENT };
