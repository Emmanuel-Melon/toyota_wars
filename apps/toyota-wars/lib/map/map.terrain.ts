// apps/toyota-wars/lib/map/map.terrain.ts
import { createNoise2D } from "simplex-noise";
import { RIDE_HEIGHT } from "../vehicles/ride-height";
import type { MapTerrainConfig } from "./map.types";

export type TerrainSampler = {
  getHeight: (worldX: number, worldZ: number) => number;
  getVehicleHeight: (worldX: number, worldZ: number) => number;
};

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createTerrainSampler(
  config: MapTerrainConfig,
  rideHeight = RIDE_HEIGHT,
): TerrainSampler {
  const noise2D = createNoise2D(mulberry32(config.seed));

  const getRawHeight = (worldX: number, worldZ: number): number => {
    let elevation = 0;
    let frequency = config.baseFrequency;
    let amplitude = config.baseAmplitude;
    let maxValue = 0;

    for (let o = 0; o < config.octaves; o++) {
      elevation += noise2D(worldX * frequency, worldZ * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= config.persistence;
      frequency *= config.lacunarity;
    }

    return (
      Math.sign(elevation) *
      Math.pow(Math.abs(elevation) / maxValue, config.power) *
      maxValue
    );
  };

  const getHeight = (worldX: number, worldZ: number): number =>
    getRawHeight(worldX, worldZ);

  return {
    getHeight,
    getVehicleHeight(this: TerrainSampler, worldX: number, worldZ: number) {
      return this.getHeight(worldX, worldZ) + rideHeight;
    },
  };
}
