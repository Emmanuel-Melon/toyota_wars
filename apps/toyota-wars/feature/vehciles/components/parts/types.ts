import type { ReactNode } from "react";
import type * as THREE from "three";
import type { VehiclePart } from "@/lib/combat/combat.teams";

export type V3 = [number, number, number];

export type FallenPartProps = {
  part: VehiclePart;
  position: V3;
  rotation?: V3;
  drop: number;
  spin?: V3;
  debris: "wheel" | "door" | "glass" | "hood";
  debrisColor?: string;
  forceDetach?: boolean;
  scatter?: number;
  children: ReactNode;
};

export type GlassPanelProps = {
  part: VehiclePart;
  position: V3;
  rotation?: V3;
  size: V3;
  glassMat: THREE.Material;
  crackMat: THREE.Material;
};

export type DoorPanelProps = {
  part: VehiclePart;
  side: number;
  z: number;
  paintMat: THREE.Material;
  chromeMat: THREE.Material;
  darkMat: THREE.Material;
};

export type GlassMaterialProps = {
  glassMat: THREE.Material;
  crackMat: THREE.Material;
};

export type SideGlassPanelProps = GlassMaterialProps & {
  part: VehiclePart;
  side: number;
  z: number;
};
