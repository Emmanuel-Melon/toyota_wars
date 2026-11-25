// soldier/soldier.palette.ts
import type { ResolvedSoldierPalette, SoldierPalette } from "./soldier.types";

// NOTE: placeholder defaults. Copy the real ones from crew-gunner.palette.ts.
export const DEFAULT_SOLDIER_PALETTE: ResolvedSoldierPalette = {
  skin: "#c58c6b",
  helmet: "#4a5239",
  lens: "#6fa8c9",
  boots: "#2b2a26",
  glove: "#1f1f1d",
  vest: "#555a43",
  uniform: "#5b6247",
  gear: "#3d4030",
};

export function resolveSoldierPalette(palette?: SoldierPalette): ResolvedSoldierPalette {
  return { ...DEFAULT_SOLDIER_PALETTE, ...palette };
}