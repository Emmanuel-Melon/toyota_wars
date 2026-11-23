// toyota-wars/lib/utility/utility.core.ts

import { clamp01 } from "../selector/math";
import { ScoredRow } from "../selector/types";
import { TANK_CONFIG } from "../tanks/tanks.config";
import type { TankIntent } from "./utility.types";

/** Throttled score table for development; returns undefined in production. */
export function createUtilityDebug(
  label: string,
): ((rows: ScoredRow<TankIntent>[], chosen: TankIntent) => void) | undefined {
  if (!TANK_CONFIG.utility.debug) return undefined;

  let lastLog = 0;
  return (rows, chosen) => {
    const now = performance.now();
    if (now - lastLog < 1000) return;
    lastLog = now;
    console.table(
      rows.map((row) => ({
        intent: row.id,
        raw: +clamp01(row.raw).toFixed(3),
        score: +row.score.toFixed(3),
      })),
    );
    console.debug(`[utility] ${label} -> ${chosen}`);
  };
}
