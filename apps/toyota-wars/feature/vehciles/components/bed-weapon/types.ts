import type { RefObject } from "react";
import type * as THREE from "three";
import type { VehiclePalette } from "../vehicle";

export type BedWeaponProps = {
  palette: VehiclePalette;
  health: number;
  maxHealth: number;
  muzzleRef?: RefObject<THREE.Object3D | null>;
  aimTargetRef?: RefObject<THREE.Vector3 | null>;
};
