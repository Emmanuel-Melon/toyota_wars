import type { Projection } from "./types";

/** Square minimap: world [-bound, +bound] → [0, size]. */
export function createProjection(bound: number, size: number): Projection {
  const scale = size / (bound * 2);
  return {
    size,
    scale,
    toX: (x) => (x + bound) * scale,
    toY: (z) => (z + bound) * scale,
  };
}
