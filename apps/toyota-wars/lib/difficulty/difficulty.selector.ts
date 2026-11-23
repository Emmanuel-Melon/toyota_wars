// lib/difficulty/difficulty.selector.ts
import type { ChooseConfig } from "@/lib/selector/types";
import type { DifficultyPreset } from "./difficulty.types";

/**
 * Pull the selector-relevant fields out of a preset. Call sites spread this
 * into `new UtilitySelector(options, children, { ...selectorReactionConfig(p), ... })`.
 */
export function selectorReactionConfig<Id extends string>(
  preset: DifficultyPreset,
): Pick<ChooseConfig<Id>, "selectionNoise" | "minCommitMs" | "momentumBonus"> {
  return {
    selectionNoise: preset.reaction.selectionNoise,
    minCommitMs: preset.reaction.minCommitMs,
    momentumBonus: preset.reaction.momentumBonus,
  };
}
