// structures/structure-slots.ts
import type { StructureVisual } from "../../types";
import type { StructureSlot } from "./structure.types";
import { getBaseSlots } from "./base-layout";

export const CHECKPOINT = {
  laneWidth: 5,
  vehicleCount: 3,
} as const;

type Footprint = Pick<StructureVisual, "width" | "depth">;

/** Road runs along local Z through the middle; the gate faces +Z. */
export function getCheckpointSlots({ width, depth }: Footprint): StructureSlot[] {
  const bayX = Math.max(CHECKPOINT.laneWidth / 2 + 4, width / 2 - 3.5);
  const slots: StructureSlot[] = [];

  // Vehicle bays behind the gate, alternating sides, angled slightly toward the road
  for (let i = 0; i < CHECKPOINT.vehicleCount; i += 1) {
    const side = i % 2 === 0 ? -1 : 1;
    const row = Math.floor(i / 2);
    slots.push({
      id: `vehicle-${i}`,
      role: "vehicle",
      position: { x: side * bayX, y: 0, z: -depth * 0.1 - row * 6.5 },
      yaw: -side * 0.3,
    });
  }

  // Guards at each booth
  const boothX = CHECKPOINT.laneWidth / 2 + 1.5;
  const gateZ = depth / 2 - 1.5;
  slots.push(
    { id: "guard-left", role: "guard", position: { x: -boothX, y: 0, z: gateZ + 1.6 }, yaw: 0 },
    { id: "guard-right", role: "guard", position: { x: boothX, y: 0, z: gateZ + 1.6 }, yaw: 0 },
  );

  return slots;
}

export const WATCHTOWER_LEG_RATIO = 0.58; // use this in watchtower.tsx instead of the literal 0.58
const WATCHTOWER_DECK_THICKNESS = 0.22;

function getWatchtowerSlots({ height }: Pick<StructureVisual, "height">): StructureSlot[] {
  return [
    {
      id: "gunner",
      role: "gunner",
      position: { x: 0, y: height * WATCHTOWER_LEG_RATIO + WATCHTOWER_DECK_THICKNESS, z: 0 },
      yaw: 0,
    },
  ];
}

export function getStructureSlots(structure: StructureVisual): StructureSlot[] {
  switch (structure.structure) {
    case "checkpoint":
      return getCheckpointSlots(structure);
    case "watchtower":
      return getWatchtowerSlots(structure);
    case "base":
      return getBaseSlots(structure, getStructureSlots);
    default:
      return [];
  }
}

/** Local slot → world transform, matching <group rotation={[0, yaw, 0]}>. */
export function slotToWorld(structure: StructureVisual, slot: StructureSlot) {
  const cos = Math.cos(structure.yaw);
  const sin = Math.sin(structure.yaw);
  const { x, y, z } = slot.position;
  return {
    position: {
      x: structure.position.x + x * cos + z * sin,
      y: structure.position.y + y,
      z: structure.position.z - x * sin + z * cos,
    },
    yaw: structure.yaw + slot.yaw,
  };
}