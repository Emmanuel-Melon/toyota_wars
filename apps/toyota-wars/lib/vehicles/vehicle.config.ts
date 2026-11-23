// lib/vehicles/vehicle.config.ts
import { MOVEMENT_CONFIG } from "../movement/movement.config";
import type { TankBodyConfig } from "../movement/movement.types";
import {
  DEFAULT_PLAYER_WEAPON_ID,
  DEFAULT_WEAPON_ID,
} from "../weapons/weapon.config";
import type { WeaponId } from "../weapons/weapon.types";
import type {
  VehicleLoadout,
  VehiclePlatform,
  VehiclePlatformId,
} from "./vehicle.types";

export const VEHICLE_PLATFORMS: Record<VehiclePlatformId, VehiclePlatform> = {
  technical: {
    id: "technical",
    mobility: 0.9,
    frontlineDurability: 0.65,
  },
  armored: {
    id: "armored",
    mobility: 0.55,
    frontlineDurability: 0.85,
  },
  support: {
    id: "support",
    mobility: 0.4,
    frontlineDurability: 0.2,
  },
};

export const DEFAULT_PLATFORM_FOR_WEAPON: Record<WeaponId, VehiclePlatformId> =
  {
    dshk: "technical",
    zu23: "armored",
    type63: "support",
  };

export const DEFAULT_VEHICLE_LOADOUT: VehicleLoadout = {
  platform: DEFAULT_PLATFORM_FOR_WEAPON[DEFAULT_WEAPON_ID],
  weapon: DEFAULT_WEAPON_ID,
};

export const DEFAULT_PLAYER_LOADOUT: VehicleLoadout = {
  platform: DEFAULT_PLATFORM_FOR_WEAPON[DEFAULT_PLAYER_WEAPON_ID],
  weapon: DEFAULT_PLAYER_WEAPON_ID,
};

export function createPlayerBodyConfig(
  platform: VehiclePlatform,
): TankBodyConfig {
  const base = MOVEMENT_CONFIG.body;
  const mobility = Math.max(platform.mobility, 0.75);

  return {
    ...base,
    fuel: { ...base.fuel },
    accelerationRampTime: 3,
    minForwardSpeed: base.minForwardSpeed * mobility,
    maxSpeed: base.maxSpeed * mobility,
    maxReverseSpeed: base.maxReverseSpeed * mobility,
    acceleration: base.acceleration * mobility,
    maxTurnRate: base.maxTurnRate * mobility,
  };
}

export function resolveVehicleLoadout(
  spawn?: {
    weapon?: WeaponId;
    platform?: VehiclePlatformId;
  } | null,
): VehicleLoadout {
  const weapon = spawn?.weapon ?? DEFAULT_WEAPON_ID;
  return {
    platform: spawn?.platform ?? DEFAULT_PLATFORM_FOR_WEAPON[weapon],
    weapon,
  };
}
