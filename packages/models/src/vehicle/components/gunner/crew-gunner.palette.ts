// packages/models/src/vehicle/components/gunner/crew-gunner.palette.ts
import type { CrewGunnerPalette, ResolvedPalette } from "../../types";

export const DEFAULT_GUNNER_PALETTE = {
  uniform: "#343d31",
  vest: "#1f241d",
  helmet: "#2b3028",
  skin: "#8d5b4c",
  glove: "#2a2d26",
  boots: "#1c1a17",
  gear: "#3b4036",
  lens: "#2f5560",
} as const;

export function resolveGunnerPalette(
  palette?: CrewGunnerPalette,
): ResolvedPalette {
  return { ...DEFAULT_GUNNER_PALETTE, ...palette };
}