// apps/toyota-wars/feature/vehciles/gunner/crew-gunner.palette.ts
// Shared palette type, defaults, and resolver.

export type CrewGunnerPalette = {
  uniform?: string;
  vest?: string;
  helmet?: string;
  skin?: string;
};

export const DEFAULT_PALETTE = {
  uniform: "#343d31", // Military olive / fatigue green
  vest: "#1f241d", // Dark tactical vest / webbing
  helmet: "#2b3028", // Matching helmet or cap
  skin: "#8d5b4c", // Stylized low-poly skin tone
} as const;

export type ResolvedPalette = {
  [K in keyof typeof DEFAULT_PALETTE]: string;
};

/**
 * Merges a partial palette onto the defaults so parts never receive
 * `undefined` for `color` (which would otherwise fall back to white).
 */
export function resolvePalette(palette?: CrewGunnerPalette): ResolvedPalette {
  return { ...DEFAULT_PALETTE, ...palette };
}
