// structures/structure-transform.ts
import type { StructureVisual } from "../../types";
import type { StructureSlot } from "./structure.types";

type Placement = Pick<StructureVisual, "position" | "yaw">;

/** Slot in a structure's local space → the parent's space (or world, for top-level structures). */
export function slotToWorld(placement: Placement, slot: StructureSlot) {
  const cos = Math.cos(placement.yaw);
  const sin = Math.sin(placement.yaw);
  const { x, y, z } = slot.position;
  return {
    position: {
      x: placement.position.x + x * cos + z * sin,
      y: placement.position.y + y,
      z: placement.position.z - x * sin + z * cos,
    },
    yaw: placement.yaw + slot.yaw,
  };
}