import type { VehiclePalette } from "../palettes";
import type {
  VehicleModelId,
  VehiclePlatformId,
} from "../vehicles/vehicle.types";
import type { WeaponId } from "@toyota/combat";

export type MapPosition = [number, number];

export type MapTerrainConfig = {
  seed: number;
  octaves: number;
  baseFrequency: number;
  baseAmplitude: number;
  persistence: number;
  lacunarity: number;
  power: number;
};

export type MapChunkConfig = {
  size: number;
  renderRadius: number;
  segments: number;
};

export type VehicleSpawn = {
  formationOffset: [number, number] | undefined;
  position: MapPosition;
  rotationY: number;
  scale?: number;
  palette: VehiclePalette;
  model?: VehicleModelId;
  weapon?: WeaponId;
  platform?: VehiclePlatformId;
};

export type SpawnConfig = {
  count: number;
  seed: number;
  center: MapPosition;
  radius: number;
  minSeparation: number;
  facing: number | { toward: MapPosition };
  palettes: readonly VehiclePalette[];
  weaponWeights?: Partial<Record<WeaponId, number>>;
  formation?: (index: number, count: number) => MapPosition | undefined;
  isValid?: (x: number, z: number) => boolean;
  headingJitter?: number;
};

export type MapDefinition = {
  id: string;
  player: {
    spawn: MapPosition;
    heading: number;
  };
  terrain: MapTerrainConfig;
  chunks: MapChunkConfig;
  allySpawns: SpawnConfig;
  opponentSpawns: SpawnConfig;
};
