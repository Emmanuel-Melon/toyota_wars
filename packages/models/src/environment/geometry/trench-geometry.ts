// packages/models/src/environment/components/trenches/trench-geometry.ts
import type { TrenchVisual } from "../types";

export const TRENCH = {
  wallSlope: 0.8, // horizontal distance over which terrain climbs from floor to ground
  liningThickness: 0.18,
  lip: 0.3, // how far the revetment stands above ground
  stepHeight: 0.9,
  stepWidth: 0.6,
  slotSpacing: 4,
  queryPad: 6, // clearanceTo() is only accurate within this distance of the edge
} as const;

export type TrenchSegment = {
  ax: number;
  az: number;
  dx: number; // unit direction
  dz: number;
  length: number;
  offset: number; // arc length at segment start
};

export function buildSegments(points: TrenchVisual["points"]): TrenchSegment[] {
  const segments: TrenchSegment[] = [];
  let offset = 0;
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    const length = Math.hypot(b.x - a.x, b.z - a.z);
    if (length < 1e-6) continue;
    segments.push({
      ax: a.x,
      az: a.z,
      dx: (b.x - a.x) / length,
      dz: (b.z - a.z) / length,
      length,
      offset,
    });
    offset += length;
  }
  return segments;
}

export type NearestHit = { dist: number; cx: number; cz: number };

export function nearestOnCenterline(
  segments: readonly TrenchSegment[],
  x: number,
  z: number,
): NearestHit {
  let best: NearestHit = { dist: Infinity, cx: 0, cz: 0 };
  for (const s of segments) {
    const t = Math.min(s.length, Math.max(0, (x - s.ax) * s.dx + (z - s.az) * s.dz));
    const cx = s.ax + s.dx * t;
    const cz = s.az + s.dz * t;
    const dist = Math.hypot(x - cx, z - cz);
    if (dist < best.dist) best = { dist, cx, cz };
  }
  return best;
}