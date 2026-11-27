// lib/vehicles/vehicle.config.ts
import { MOVEMENT_CONFIG } from "../movement/movement.config";
import type { TankBodyConfig } from "../movement/movement.types";
import { DEFAULT_PLAYER_WEAPON_ID, type WeaponId } from "@toyota/combat";
import { hiluxVehicle } from "./definitions/hilux.vehicle";
import { landCruiserVehicle } from "./definitions/land-cruiser.vehicle";
import { hiaceVehicle } from "./definitions/hiace.vehicle";
import { radarVehicle } from "./definitions/radar.vehicle";
import type {
  VehicleLoadout,
  VehicleModel,
  VehicleModelId,
  VehiclePlatform,
  VehiclePlatformId,
} from "./vehicle.types";

export const VEHICLE_MODEL_IDS = [
  "hilux",
  "land-cruiser",
  "hiace",
  "radar",
] as const satisfies readonly VehicleModelId[];

export const PLAYER_SELECTABLE_VEHICLE_MODEL_IDS: readonly VehicleModelId[] = [
  "hilux",
  "land-cruiser",
  "hiace",
];

export const VEHICLE_MODELS: Record<VehicleModelId, VehicleModel> = {
  hilux: hiluxVehicle,
  "land-cruiser": landCruiserVehicle,
  hiace: hiaceVehicle,
  radar: radarVehicle,
};

export const DEFAULT_VEHICLE_MODEL_ID: VehicleModelId = "land-cruiser";

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

export const DEFAULT_MODEL_FOR_WEAPON: Record<WeaponId, VehicleModelId> = {
  dshk: "hilux",
  zu23: "land-cruiser",
  type63: "hiace",
};

export const DEFAULT_MODEL_FOR_PLATFORM: Record<
  VehiclePlatformId,
  VehicleModelId
> = {
  technical: "hilux",
  armored: "land-cruiser",
  support: "hiace",
};

export const DEFAULT_PLATFORM_FOR_WEAPON: Record<WeaponId, VehiclePlatformId> =
  {
    dshk: VEHICLE_MODELS[DEFAULT_MODEL_FOR_WEAPON.dshk].platform,
    zu23: VEHICLE_MODELS[DEFAULT_MODEL_FOR_WEAPON.zu23].platform,
    type63: VEHICLE_MODELS[DEFAULT_MODEL_FOR_WEAPON.type63].platform,
  };

export function createVehicleLoadout(modelId: VehicleModelId): VehicleLoadout {
  const model = VEHICLE_MODELS[modelId];
  return {
    model: model.id,
    platform: model.platform,
    weapon: model.weapon,
  };
}

export const DEFAULT_VEHICLE_LOADOUT = createVehicleLoadout(
  DEFAULT_VEHICLE_MODEL_ID,
);

export const DEFAULT_PLAYER_LOADOUT = createVehicleLoadout(
  DEFAULT_MODEL_FOR_WEAPON[DEFAULT_PLAYER_WEAPON_ID],
);

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

export type VehicleSpawnIdentity = {
  model?: VehicleModelId;
  weapon?: WeaponId;
  platform?: VehiclePlatformId;
};

export function resolveVehicleModel(
  spawn?: VehicleSpawnIdentity | null,
): VehicleModel {
  if (spawn?.model) return VEHICLE_MODELS[spawn.model];
  if (spawn?.weapon)
    return VEHICLE_MODELS[DEFAULT_MODEL_FOR_WEAPON[spawn.weapon]];
  if (spawn?.platform) {
    return VEHICLE_MODELS[DEFAULT_MODEL_FOR_PLATFORM[spawn.platform]];
  }
  return VEHICLE_MODELS[DEFAULT_VEHICLE_MODEL_ID];
}

export function resolveVehicleLoadout(
  spawn?: VehicleSpawnIdentity | null,
): VehicleLoadout {
  return createVehicleLoadout(resolveVehicleModel(spawn).id);
}
