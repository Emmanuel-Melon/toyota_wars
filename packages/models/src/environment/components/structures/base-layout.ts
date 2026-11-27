// structures/base-layout.ts
import type { StructureVisual } from "../../types";
import type { BasePart, BasePartKind, StructureSlot } from "./structure.types";
import { slotToWorld } from "./structure-transform";

export const BASE = {
  gateGap: 24,
  wallHeight: 2.2,
  wallThickness: 0.6,
  towerInset: 4,
  motorPool: { columns: 2, rows: 2, spacingX: 8, spacingZ: 10 },
  checkpoint: { width: 20, depth: 16, height: 3 },
} as const;

type Footprint = Pick<StructureVisual, "width" | "depth">;
type Vec3 = [number, number, number];

export type BaseWall = { id: string; position: Vec3; size: Vec3 };

export type BaseLayout = {
  walls: BaseWall[];
  parts: BasePart[];
  motorPoolPad: { position: Vec3; size: Vec3 };
  slots: StructureSlot[]; // slots owned by the base itself
};

const part = (
  id: string,
  structure: BasePartKind,
  x: number,
  z: number,
  yaw: number,
  width: number,
  depth: number,
  height: number,
): BasePart => ({ id, structure, position: { x, y: 0, z }, yaw, width, depth, height });

/** Gate faces +Z. Needs roughly width >= 60 and depth >= 70 to avoid overlaps. */
export function getBaseLayout({ width, depth }: Footprint): BaseLayout {
  const hx = width / 2;
  const hz = depth / 2;
  const { wallHeight: h, wallThickness: t, gateGap } = BASE;
  const frontLen = (width - gateGap) / 2;
  const frontX = gateGap / 2 + frontLen / 2;

  const walls: BaseWall[] = [
    { id: "wall-back", position: [0, h / 2, -hz], size: [width, h, t] },
    { id: "wall-left", position: [-hx, h / 2, 0], size: [t, h, depth] },
    { id: "wall-right", position: [hx, h / 2, 0], size: [t, h, depth] },
    { id: "wall-front-left", position: [-frontX, h / 2, hz], size: [frontLen, h, t] },
    { id: "wall-front-right", position: [frontX, h / 2, hz], size: [frontLen, h, t] },
  ];

  const tx = hx - BASE.towerInset;
  const tz = hz - BASE.towerInset;
  const towers = (
    [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const
  ).map(([sx, sz], i) => part(`tower-${i}`, "watchtower", sx * tx, sz * tz, 0, 4, 4, 8));

  const cp = BASE.checkpoint;
  const commandZ = -hz + 9;

  const parts: BasePart[] = [
    ...towers,
    part("gate", "checkpoint", 0, hz - cp.depth / 2 - 1, 0, cp.width, cp.depth, cp.height),
    part("command", "building", 0, commandZ, 0, 14, 9, 5),
    part("barracks-left", "building", -width * 0.3, -depth * 0.2, 0, 16, 6, 3.5),
    part("barracks-right", "building", width * 0.3, -depth * 0.2, 0, 16, 6, 3.5),
  ];

  // Motor pool: grid of vehicle bays on a flat pad, facing the gate
  const pool = BASE.motorPool;
  const origin = { x: -width * 0.25, z: depth * 0.08 };
  const slots: StructureSlot[] = [];
  for (let r = 0; r < pool.rows; r += 1) {
    for (let c = 0; c < pool.columns; c += 1) {
      slots.push({
        id: `motor-pool-${r * pool.columns + c}`,
        role: "vehicle",
        position: { x: origin.x + c * pool.spacingX, y: 0, z: origin.z + r * pool.spacingZ },
        yaw: 0,
      });
    }
  }
  // Sentries at the command building entrance
  slots.push(
    { id: "sentry-left", role: "guard", position: { x: -3, y: 0, z: commandZ + 6 }, yaw: 0 },
    { id: "sentry-right", role: "guard", position: { x: 3, y: 0, z: commandZ + 6 }, yaw: 0 },
  );

  const padW = (pool.columns - 1) * pool.spacingX + 8;
  const padD = (pool.rows - 1) * pool.spacingZ + 10;
  const motorPoolPad = {
    position: [
      origin.x + ((pool.columns - 1) * pool.spacingX) / 2,
      0.03,
      origin.z + ((pool.rows - 1) * pool.spacingZ) / 2,
    ] as Vec3,
    size: [padW, 0.06, padD] as Vec3,
  };

  return { walls, parts, motorPoolPad, slots };
}

/** Base slots plus every child's slots, mapped into base-local space. */
export function getBaseSlots(
  structure: Footprint,
  slotsFor: (part: BasePart) => StructureSlot[],
): StructureSlot[] {
  const layout = getBaseLayout(structure);
  const childSlots = layout.parts.flatMap((p) =>
    slotsFor(p).map((slot) => {
      const placed = slotToWorld(p, slot);
      return { ...slot, id: `${p.id}/${slot.id}`, position: placed.position, yaw: placed.yaw };
    }),
  );
  return [...layout.slots, ...childSlots];
}