import type { ReactNode, RefObject } from "react";
import type * as THREE from "three";

export type V3 = [number, number, number];

export type VehiclePalette = {
  body: string;
  cabin: string;
  accent: string;
};

export type CrewGunnerPalette = Partial<{
  uniform: string;
  vest: string;
  helmet: string;
  skin: string;
  glove: string;
  boots: string;
  gear: string;
  lens: string;
}>;

export type ResolvedPalette = Required<CrewGunnerPalette>;

export type WeaponMountKind = "heavyMg" | "autocannon" | "rocketPod";

export type MuzzleOffset = {
  right: number;
  up?: number;
};

export type VehicleMaterials = {
  paint: THREE.Material;
  trim: THREE.Material;
  cabin: THREE.Material;
  dark: THREE.Material;
  glass: THREE.Material;
  glassCrack: THREE.Material;
  chrome: THREE.Material;
  headlight: THREE.Material;
  taillight: THREE.Material;
};

export type PickupCabProps = {
  materials: VehicleMaterials;
  doors?: ReactNode;
  windows?: ReactNode;
  extra?: ReactNode;
};

export type PickupBedProps = {
  materials: VehicleMaterials;
};

export type PickupShellProps = {
  materials: VehicleMaterials;
  children?: ReactNode;
};

export type PickupHullVisualProps = {
  materials: VehicleMaterials;
  doors?: ReactNode;
  windows?: ReactNode;
  hood?: ReactNode;
  children?: ReactNode;
};

export type DoorPanelVisualProps = {
  side: number;
  z: number;
  paintMat: THREE.Material;
  chromeMat: THREE.Material;
  darkMat: THREE.Material;
  showNumber?: boolean;
  numberTexture?: THREE.Texture | null;
  numberColor?: string;
};

export type GlassMaterialProps = {
  glassMat: THREE.Material;
  crackMat: THREE.Material;
  cracked?: boolean;
};

export type GlassPanelVisualProps = GlassMaterialProps & {
  position: V3;
  rotation?: V3;
  size: V3;
};

export type SideGlassPanelVisualProps = GlassMaterialProps & {
  side: number;
  z: number;
};

export type HoodPanelVisualProps = {
  paintMat: THREE.Material;
  damage?: number;
  numberTexture?: THREE.Texture | null;
  numberColor?: string;
};

export type WheelVisualProps = {
  side: number;
  steerRef?: RefObject<THREE.Group | null>;
  spinRef?: RefObject<THREE.Group | null>;
  showSuspension?: boolean;
  radius?: number;
  width?: number;
};

export type BedMountProps = {
  palette: VehiclePalette;
  mount: WeaponMountKind;
  yawRef: RefObject<THREE.Group | null>;
  pitchRef: RefObject<THREE.Group | null>;
  slideRef: RefObject<THREE.Group | null>;
  muzzleRef?: RefObject<THREE.Object3D | null>;
  muzzleZ: number;
  weapon?: ReactNode;
  gunner?: ReactNode;
  effects?: ReactNode;
};
