// trenches/trench-layout.ts
import type { TerrainSampler, TrenchVisual } from "../../types";
import type { StructureSlot } from "../structures/structure.types";
import { buildSegments, TRENCH } from "../../geometry/trench-geometry";

export type TrenchPiece = {
  id: string;
  x: number;
  y: number; // floor height at the segment midpoint
  z: number;
  yaw: number;
  pitch: number;
  length: number;
  width: number;
  depth: number;
  front: 1 | -1;
};

/** `terrain` must be the carved sampler, so centerline heights are floor heights. */
export function getTrenchPieces(trench: TrenchVisual, terrain: TerrainSampler): TrenchPiece[] {
  return buildSegments(trench.points).map((s, i) => {
    const bx = s.ax + s.dx * s.length;
    const bz = s.az + s.dz * s.length;
    const y0 = terrain.getHeight(s.ax, s.az);
    const y1 = terrain.getHeight(bx, bz);
    return {
      id: `${trench.id}/seg-${i}`,
      x: (s.ax + bx) / 2,
      y: (y0 + y1) / 2,
      z: (s.az + bz) / 2,
      yaw: Math.atan2(-s.dz, s.dx), // local +x runs along the segment
      pitch: Math.atan2(y1 - y0, s.length),
      length: Math.hypot(s.length, y1 - y0),
      width: trench.width,
      depth: trench.depth,
      front: trench.front ?? 1,
    };
  });
}

/** Guard slots on the firing step, facing the front side. World space, ready to spawn. */
export function getTrenchSlots(trench: TrenchVisual, terrain: TerrainSampler): StructureSlot[] {
  const segments = buildSegments(trench.points);
  const total = segments.reduce((sum, s) => sum + s.length, 0);
  const front = trench.front ?? 1;
  const inset = trench.width / 2 - TRENCH.stepWidth / 2;
  const slots: StructureSlot[] = [];

  for (let d = TRENCH.slotSpacing / 2, i = 0; d < total; d += TRENCH.slotSpacing, i += 1) {
    const s = segments.find((seg) => d >= seg.offset && d <= seg.offset + seg.length);
    if (!s) continue;
    const along = d - s.offset;
    const nx = -s.dz * front; // front-facing normal
    const nz = s.dx * front;
    const x = s.ax + s.dx * along + nx * inset;
    const z = s.az + s.dz * along + nz * inset;
    slots.push({
      id: `${trench.id}/post-${i}`,
      role: "guard",
      position: { x, y: terrain.getHeight(x, z), z },
      yaw: Math.atan2(nx, nz), // assumes yaw 0 faces +Z, like the structure slots
    });
  }
  return slots;
}

export function trenchSlotSpawns(trenches: readonly TrenchVisual[], terrain: TerrainSampler) {
  return trenches.flatMap((t) =>
    getTrenchSlots(t, terrain).map((slot) => ({
      id: slot.id,
      position: slot.position,
      yaw: slot.yaw,
    })),
  );
}