import type { ChooseConfig } from "../utility/types";

export type DifficultyTier = "novice" | "regular" | "veteran" | "elite";

export interface TacticalCapabilities {
  artilleryRearEchelon: boolean;
  coordinatedFlank: boolean;
  focusFire: boolean;
  counterAmbush: boolean;
  reserveAllocation: boolean;
  feignedRetreat: boolean;
  overwatch: boolean;
}

export interface ReactionTuning {
  selectionNoise: number;
  minCommitMs: number;
  momentumBonus: number;
}

export interface DifficultyPreset {
  readonly tier: DifficultyTier;
  readonly capabilities: TacticalCapabilities;
  readonly reaction: ReactionTuning;
}

const NONE: TacticalCapabilities = {
  artilleryRearEchelon: false,
  coordinatedFlank: false,
  focusFire: false,
  counterAmbush: false,
  reserveAllocation: false,
  feignedRetreat: false,
  overwatch: false,
};

export const DIFFICULTY: Record<DifficultyTier, DifficultyPreset> = {
  novice: {
    tier: "novice",
    capabilities: { ...NONE },
    reaction: { selectionNoise: 0.3, minCommitMs: 1500, momentumBonus: 0.05 },
  },
  regular: {
    tier: "regular",
    capabilities: { ...NONE, artilleryRearEchelon: true },
    reaction: { selectionNoise: 0.15, minCommitMs: 900, momentumBonus: 0.1 },
  },
  veteran: {
    tier: "veteran",
    capabilities: {
      ...NONE,
      artilleryRearEchelon: true,
      coordinatedFlank: true,
      focusFire: true,
      counterAmbush: true,
    },
    reaction: { selectionNoise: 0.05, minCommitMs: 600, momentumBonus: 0.15 },
  },
  elite: {
    tier: "elite",
    capabilities: {
      artilleryRearEchelon: true,
      coordinatedFlank: true,
      focusFire: true,
      counterAmbush: true,
      reserveAllocation: true,
      feignedRetreat: true,
      overwatch: true,
    },
    reaction: { selectionNoise: 0, minCommitMs: 400, momentumBonus: 0.2 },
  },
};

export const FULL_CAPABILITIES: TacticalCapabilities = {
  ...DIFFICULTY.elite.capabilities,
};

export function selectorReactionConfig<Id extends string>(
  preset: DifficultyPreset,
): Pick<ChooseConfig<Id>, "selectionNoise" | "minCommitMs" | "momentumBonus"> {
  return {
    selectionNoise: preset.reaction.selectionNoise,
    minCommitMs: preset.reaction.minCommitMs,
    momentumBonus: preset.reaction.momentumBonus,
  };
}
