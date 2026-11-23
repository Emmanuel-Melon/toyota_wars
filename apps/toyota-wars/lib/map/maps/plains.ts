import { ALLY_PALETTES, ENEMY_PALETTES } from "../../palettes";
import { createRoadNetwork, type RoadNetwork } from "../map.network";
import { createTerrainSampler } from "../map.terrain";
import { createArenaWorld } from "../map.world";
import type { MapDefinition, MapPosition } from "../map.types";

const PLAYER_SPAWN: MapPosition = [216, 216];
const PLAYER_HEADING = (-3 * Math.PI) / 4;

const ALLY_SLOTS: MapPosition[] = [
  [-7, -6],
  [0, -6],
  [7, -6],
  [-8, -13],
  [0, -13],
  [8, -13],
  [-7, -20],
  [0, -20],
  [7, -20],
];

export const PLAINS_MAP: MapDefinition & {
  roads: RoadNetwork;
} = {
  id: "plains",
  player: {
    spawn: PLAYER_SPAWN,
    heading: PLAYER_HEADING,
  },
  terrain: {
    seed: 1337,
    octaves: 3,
    baseFrequency: 0.0045,
    baseAmplitude: 5,
    persistence: 0.38,
    lacunarity: 1.9,
    power: 1,
  },
  chunks: {
    size: 120,
    renderRadius: 1,
    segments: 64,
  },
  allySpawns: {
    seed: 42,
    count: ALLY_SLOTS.length,
    center: [228, 228],
    radius: 30,
    minSeparation: 15,
    facing: PLAYER_HEADING,
    palettes: Object.values(ALLY_PALETTES),
    weaponWeights: { dshk: 2, zu23: 1 },
    formation: (i) => ALLY_SLOTS[i],
    // Optional: Keep spawns off roads
    isValid: (x, z) => PLAINS_MAP.roads.distanceToRoad(x, z) > 8,
  },
  opponentSpawns: {
    seed: 1337,
    count: 10,
    center: [-216, -216],
    radius: 48,
    minSeparation: 18,
    facing: { toward: [0, 0] },
    palettes: Object.values(ENEMY_PALETTES),
    weaponWeights: { dshk: 3, zu23: 3, type63: 1 },
    isValid: (x, z) => PLAINS_MAP.roads.distanceToRoad(x, z) > 8,
  },
  // Initialize roads connecting Player Base -> Center Hub -> Enemy Base
  roads: null as any, // Temporary placeholder for circular reference initialization below
};

// Initialize terrain sampler first
export const PLAINS_TERRAIN = createTerrainSampler(PLAINS_MAP.terrain);

// Initialize road network connecting base endpoints
PLAINS_MAP.roads = createRoadNetwork(
  createArenaWorld(
    [
      PLAYER_SPAWN, // Point A: Player / Ally Base
      [0, 0], // Central tactical intersection / battlefield hub
      [-216, -216], // Point B: Enemy Base Outpost
    ],
    24, // Road width in world units
  ),
  PLAINS_TERRAIN,
);
