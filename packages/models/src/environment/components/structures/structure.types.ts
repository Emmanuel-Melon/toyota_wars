// structures/structure.types.ts
import type { BoxGeometry, MeshStandardMaterial } from "three";
import type { StructureVisual } from "../../types";

export type StructureMaterials = {
  wall: MeshStandardMaterial;
  trim: MeshStandardMaterial;
  roof: MeshStandardMaterial;
  wood: MeshStandardMaterial;
  sandbag: MeshStandardMaterial;
  stripeRed: MeshStandardMaterial;
  stripeWhite: MeshStandardMaterial;
};

export type StructurePartProps = {
  structure: StructureVisual;
  materials: StructureMaterials;
  unitBox: BoxGeometry;
};

export type BasePartKind = "building" | "watchtower" | "checkpoint";
export type BasePart = StructureVisual & { structure: BasePartKind };
export type StructureSlotRole = "vehicle" | "guard" | "gunner";

/** Local-space anchor inside a structure (relative to its origin, before yaw). */
export type StructureSlot = {
  id: string;
  role: StructureSlotRole;
  position: { x: number; y: number; z: number };
  yaw: number;
};