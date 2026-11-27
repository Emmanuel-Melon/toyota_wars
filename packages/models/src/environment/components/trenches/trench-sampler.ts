// trenches/trench-sampler.ts
import type { TerrainSampler, TrenchVisual } from "../../types";
import { buildSegments, nearestOnCenterline, TRENCH } from "../../geometry/trench-geometry";
import type { TrenchSegment } from "../../geometry/trench-geometry";

export type TrenchField = {
  /** Distance outside the nearest trench's interior edge (negative = inside). Infinity if far away. */
  clearanceTo: (x: number, z: number) => number;
};

type Compiled = {
  def: TrenchVisual;
  segments: TrenchSegment[];
  halfWidth: number;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
};

function compile(def: TrenchVisual): Compiled {
  const halfWidth = def.width / 2;
  const reach = halfWidth + TRENCH.wallSlope + TRENCH.queryPad;
  const xs = def.points.map((p) => p.x);
  const zs = def.points.map((p) => p.z);
  return {
    def,
    segments: buildSegments(def.points),
    halfWidth,
    minX: Math.min(...xs) - reach,
    maxX: Math.max(...xs) + reach,
    minZ: Math.min(...zs) - reach,
    maxZ: Math.max(...zs) + reach,
  };
}

const smooth = (excess: number) => {
  const s = Math.min(1, Math.max(0, excess / TRENCH.wallSlope));
  return s * s * (3 - 2 * s);
};

/** Wrap a terrain sampler so trenches are physically carved into it. */
export function withTrenches<T extends TerrainSampler>(
  base: T,
  trenches: readonly TrenchVisual[],
): T & TrenchField {
  const compiled = trenches.map(compile);

  const nearest = (x: number, z: number) => {
    let best: { excess: number; cx: number; cz: number; c: Compiled } | null = null;
    for (const c of compiled) {
      if (x < c.minX || x > c.maxX || z < c.minZ || z > c.maxZ) continue;
      const hit = nearestOnCenterline(c.segments, x, z);
      const excess = hit.dist - c.halfWidth;
      if (!best || excess < best.excess) best = { excess, cx: hit.cx, cz: hit.cz, c };
    }
    return best;
  };

  const getHeight = (x: number, z: number) => {
    const baseHeight = base.getHeight(x, z);
    const hit = nearest(x, z);
    if (!hit || hit.excess >= TRENCH.wallSlope) return baseHeight;
    const floorY = base.getHeight(hit.cx, hit.cz) - hit.c.def.depth;
    const carved = floorY + (baseHeight - floorY) * smooth(hit.excess);
    return Math.min(baseHeight, carved);
  };

  const clearanceTo = (x: number, z: number) => nearest(x, z)?.excess ?? Infinity;

  return { ...base, getHeight, clearanceTo } as T & TrenchField;
}