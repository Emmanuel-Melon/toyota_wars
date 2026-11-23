// lib/difficulty/difficulty.presets.ts
import type {
  DifficultyPreset,
  DifficultyTier,
  TacticalCapabilities,
} from "./difficulty.types";

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

/** All capabilities on. Safe default for call sites that don't specify a tier. */
export const FULL_CAPABILITIES: TacticalCapabilities = {
  ...DIFFICULTY.elite.capabilities,
};
