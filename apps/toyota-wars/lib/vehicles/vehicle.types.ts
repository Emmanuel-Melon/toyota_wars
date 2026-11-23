// lib/vehicles/vehicle.types.ts
import type { WeaponId } from "../weapons/weapon.types";

export type VehiclePlatformId = "technical" | "armored" | "support";

export interface VehiclePlatform {
  id: VehiclePlatformId;
  /** 0..1: Speed and agility of the platform. */
  mobility: number;
  /** 0..1: Willingness to hold close/medium line vs. staying at standoff range. */
  frontlineDurability: number;
}

export interface VehicleLoadout {
  platform: VehiclePlatformId;
  weapon: WeaponId;
}
