// apps/toyota-wars/lib/meso/meso.config.ts
export const MESO_CONFIG = {
  /** Local radius (in meters) to check for nearby enemies and allies during pursuit/retreat */
  localAwarenessRadius: 180,
  /**
   * If local allies / local enemies >= this ratio during a retreat,
   * the force has sufficient numerical superiority to counter-ambush.
   * E.g., 7 allies vs 4 enemies = 1.75 ratio (exceeds 1.2 threshold).
   */
  counterAmbushSuperiorityRatio: 1.2,
  /** Minimum health percentage required to initiate a counter-ambush */
  minHealthForCounterAttack: 0.35,
} as const;
