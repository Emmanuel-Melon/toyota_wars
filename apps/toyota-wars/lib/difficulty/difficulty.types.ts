import { ScoredRow } from "../selector/types";

// lib/difficulty/difficulty.types.ts
export type DifficultyTier = "novice" | "regular" | "veteran" | "elite";

/**
 * What the AI is *allowed* to do. Higher tiers enable a superset of lower
 * tiers — never remove a capability when moving up. Adding a new field here
 * is a pure type extension; nothing consumes it until a call site reads it.
 */
export interface TacticalCapabilities {
  artilleryRearEchelon: boolean;
  coordinatedFlank: boolean;
  focusFire: boolean;
  counterAmbush: boolean;
  reserveAllocation: boolean;
  feignedRetreat: boolean;
  overwatch: boolean;
}

/** How decisively the AI acts on its own scores. Independent of capabilities. */
export interface ReactionTuning {
  /** Uniform noise half-width applied to each option's final score. 0 = deterministic. */
  selectionNoise: number;
  /** Minimum dwell time on the current option before switching. */
  minCommitMs: number;
  /** Bonus to the current option if still viable (raw > 0). */
  momentumBonus: number;
}

export interface DifficultyPreset {
  readonly tier: DifficultyTier;
  readonly capabilities: TacticalCapabilities;
  readonly reaction: ReactionTuning;
}
