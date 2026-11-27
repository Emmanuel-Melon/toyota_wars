// lib/vehicles/vehicle.types.ts
import type { TargetPart, WeaponId } from "@toyota/combat";

export type VehiclePlatformId = "technical" | "armored" | "support";

export type VehicleModelId = "hilux" | "land-cruiser" | "hiace" | "radar";

export type VehicleBodyKind = "pickup" | "suv" | "van";

export type VehicleAxle = {
  z: number;
  steers: boolean;
};

export type VehicleFrame = {
  colliderHalfExtents: [number, number, number];
  axleY: number;
  axles: readonly VehicleAxle[];
  trackHalfWidth: number;
  wheelRadius: number;
  mountPosition: [number, number, number];
  hitboxes: readonly TargetPart[];
};

export interface VehiclePlatform {
  id: VehiclePlatformId;
  /** 0..1: Speed and agility of the platform. */
  mobility: number;
  /** 0..1: Willingness to hold close/medium line vs. staying at standoff range. */
  frontlineDurability: number;
}

export interface VehicleModel {
  id: VehicleModelId;
  label: string;
  description: string;
  body: VehicleBodyKind;
  platform: VehiclePlatformId;
  weapon: WeaponId;
  frame: VehicleFrame;
}

export interface VehicleLoadout {
  model: VehicleModelId;
  platform: VehiclePlatformId;
  weapon: WeaponId;
}
