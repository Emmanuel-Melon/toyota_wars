import type { CrewGunnerPalette, ResolvedPalette } from "../../types";

export const DEFAULT_GUNNER_PALETTE = {
  uniform: "#343d31",
  vest: "#1f241d",
  helmet: "#2b3028",
  skin: "#8d5b4c",
} as const;

export function resolveGunnerPalette(
  palette?: CrewGunnerPalette,
): ResolvedPalette {
  return { ...DEFAULT_GUNNER_PALETTE, ...palette };
}
