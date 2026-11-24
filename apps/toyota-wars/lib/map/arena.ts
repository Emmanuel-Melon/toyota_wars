import * as THREE from "three";
import type { Mission, MissionArena, Vec2 } from "@toyota/missions";
import {
  createRoadNetwork,
  gradeTerrain,
  type RoadNetwork,
} from "./map.network";
import { createArenaWorld } from "./map.world";
import { createSpawns } from "./map.spawns";
import { createTerrainSampler, type TerrainSampler } from "./map.terrain";
import type {
  MapChunkConfig,
  MapPosition,
  MapTerrainConfig,
} from "./map.types";
import { PLAINS_MAP } from "./maps/plains";
import { createStructures, type ArenaStructure } from "./structures";

export const ARENA_LEVEL_IDS = ["plains"] as const;

export type ArenaLevelId = (typeof ARENA_LEVEL_IDS)[number];

type ArenaLevel = {
  terrain: MapTerrainConfig;
  chunks: MapChunkConfig;
  roadWidth: number;
};

const ARENA_LEVELS: Record<ArenaLevelId, ArenaLevel> = {
  plains: {
    terrain: PLAINS_MAP.terrain,
    chunks: PLAINS_MAP.chunks,
    roadWidth: 24,
  },
};

const DEFAULT_ARENA_LEVEL: ArenaLevelId = "plains";

export type ArenaObstacle = {
  id: string;
  position: THREE.Vector3;
  radius: number;
  scale?: number;
  rotation?: number;
  destructible?: boolean;
  shape?: "box";
  halfWidth?: number;
  halfDepth?: number;
  yaw?: number;
  height?: number;
  structure?: "building" | "watchtower";
  locationId?: string;
};

export type ArenaRuntime = {
  levelId: ArenaLevelId;
  seed: number;
  size: number;
  /** Half-extent of the square playable area. */
  bound: number;
  obstacleDensity: number;
  terrain: TerrainSampler;
  roads: RoadNetwork;
  roadWidth: number;
  chunks: MapChunkConfig;
  obstacles: readonly ArenaObstacle[];
  structures: readonly ArenaStructure[];
  playerSpawn: MapPosition;
  playerHeading: number;
};

export type ArenaSource = {
  arena: MissionArena;
  squads?: readonly Pick<Mission["squads"][number], "team" | "spawnPoints">[];
  /** Extra points that obstacles must not overlap (e.g. generated skirmish spawns). */
  clearancePoints?: readonly MapPosition[];
  structureSeed?: number;
};

const DEFAULT_CLEARANCE_POINTS: readonly MapPosition[] = [
  ...createSpawns(PLAINS_MAP.allySpawns).map((spawn) => spawn.position),
  ...createSpawns(PLAINS_MAP.opponentSpawns).map((spawn) => spawn.position),
];

export const DEFAULT_ARENA: ArenaSource = {
  arena: {
    levelId: PLAINS_MAP.id,
    seed: PLAINS_MAP.terrain.seed,
    size: 600,
    obstacleDensity: 0.3,
    playerSpawn: {
      x: PLAINS_MAP.player.spawn[0],
      z: PLAINS_MAP.player.spawn[1],
    },
    heading: PLAINS_MAP.player.heading,
    roads: {
      waypoints: [
        {
          x: PLAINS_MAP.player.spawn[0],
          z: PLAINS_MAP.player.spawn[1],
        },
        { x: 0, z: 0 },
        {
          x: PLAINS_MAP.opponentSpawns.center[0],
          z: PLAINS_MAP.opponentSpawns.center[1],
        },
      ],
      width: 24,
    },
  },
  clearancePoints: DEFAULT_CLEARANCE_POINTS,
};

const MIN_OBSTACLE_RADIUS = 2.5;
const MAX_OBSTACLE_RADIUS = 6.5;
const OBSTACLE_AREA_EACH = 1200;
const OBSTACLE_SPACING = 4;
const OBSTACLE_SPAWN_CLEARANCE = 10;
const OBSTACLE_ROAD_SHOULDER = 4;
const OBSTACLE_ATTEMPTS = 32;

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

function resolveLevel(levelId?: string): {
  id: ArenaLevelId;
  level: ArenaLevel;
} {
  if (!levelId)
    return {
      id: DEFAULT_ARENA_LEVEL,
      level: ARENA_LEVELS[DEFAULT_ARENA_LEVEL],
    };
  if (!Object.prototype.hasOwnProperty.call(ARENA_LEVELS, levelId)) {
    throw new Error(`Unknown arena level "${levelId}"`);
  }
  const id = levelId as ArenaLevelId;
  return { id, level: ARENA_LEVELS[id] };
}

function uniqueWaypoints(points: MapPosition[]): MapPosition[] {
  const result: MapPosition[] = [];
  for (const point of points) {
    const previous = result[result.length - 1];
    if (
      !previous ||
      Math.hypot(previous[0] - point[0], previous[1] - point[1]) > 0.001
    ) {
      result.push(point);
    }
  }
  return result;
}

function enemyCenter(source: ArenaSource): MapPosition {
  const points = (source.squads ?? [])
    .filter((squad) => squad.team === "enemy")
    .flatMap((squad) => squad.spawnPoints);

  if (points.length === 0) return [0, 0];

  const total = points.reduce(
    (sum, point) => [sum[0] + point.x, sum[1] + point.z] as MapPosition,
    [0, 0] as MapPosition,
  );
  return [total[0] / points.length, total[1] / points.length];
}

function roadWaypoints(source: ArenaSource): MapPosition[] {
  const authored = source.arena.roads?.waypoints;
  if (authored) {
    return uniqueWaypoints(authored.map((point) => [point.x, point.z]));
  }

  const spawn = source.arena.playerSpawn;
  return uniqueWaypoints([[spawn.x, spawn.z], [0, 0], enemyCenter(source)]);
}

function spawnPoints(source: ArenaSource): MapPosition[] {
  const spawn = source.arena.playerSpawn;
  return [
    [spawn.x, spawn.z],
    ...(source.squads ?? []).flatMap((squad) =>
      squad.spawnPoints.map((point) => [point.x, point.z] as MapPosition),
    ),
    ...(source.clearancePoints ?? []),
  ];
}

function playerHeading(spawn: Vec2): number {
  if (spawn.x === 0 && spawn.z === 0) return 0;
  return Math.atan2(-spawn.x, -spawn.z);
}

function chunkConfig(size: number, base: MapChunkConfig): MapChunkConfig {
  return {
    ...base,
    renderRadius: Math.max(
      base.renderRadius,
      Math.ceil(size / (2 * base.size)),
    ),
  };
}

function createObstacles(
  source: ArenaSource,
  terrain: TerrainSampler,
  roads: RoadNetwork,
  roadWidth: number,
  structures: readonly ArenaStructure[],
): ArenaObstacle[] {
  const { seed, size, obstacleDensity } = source.arena;
  const targetCount = Math.round(
    ((size * size) / OBSTACLE_AREA_EACH) * obstacleDensity,
  );
  if (targetCount <= 0) return [];

  const random = mulberry32(seed ^ 0x9e3779b9);
  const half = size / 2;
  const placementHalf = half - MAX_OBSTACLE_RADIUS - 2;
  if (placementHalf <= 0) return [];

  const spawns = spawnPoints(source);
  const obstacles: ArenaObstacle[] = [];

  for (let index = 0; index < targetCount; index++) {
    for (let attempt = 0; attempt < OBSTACLE_ATTEMPTS; attempt++) {
      const radius =
        MIN_OBSTACLE_RADIUS +
        random() * (MAX_OBSTACLE_RADIUS - MIN_OBSTACLE_RADIUS);
      const x = (random() * 2 - 1) * placementHalf;
      const z = (random() * 2 - 1) * placementHalf;

      if (
        spawns.some(
          ([sx, sz]) =>
            Math.hypot(x - sx, z - sz) < OBSTACLE_SPAWN_CLEARANCE + radius,
        )
      ) {
        continue;
      }

      if (
        roads.paths.length > 0 &&
        (roads.distanceToRoad(x, z) <
          roadWidth / 2 + radius + OBSTACLE_ROAD_SHOULDER ||
          roads.locationsNear(x, z, radius + OBSTACLE_ROAD_SHOULDER).length > 0)
      ) {
        continue;
      }

      if (
        structures.some(
          (structure) =>
            Math.hypot(x - structure.position.x, z - structure.position.z) <
            structure.radius + radius + OBSTACLE_SPACING,
        )
      ) {
        continue;
      }

      if (
        obstacles.some(
          (obstacle) =>
            Math.hypot(x - obstacle.position.x, z - obstacle.position.z) <
            obstacle.radius + radius + OBSTACLE_SPACING,
        )
      ) {
        continue;
      }

      obstacles.push({
        id: `obstacle-${index}`,
        position: new THREE.Vector3(x, terrain.getHeight(x, z), z),
        radius,
        scale: radius,
        rotation: random() * Math.PI * 2,
      });
      break;
    }
  }

  return obstacles;
}

export function createArenaRuntime(source: ArenaSource): ArenaRuntime {
  const { id: levelId, level } = resolveLevel(source.arena.levelId);
  const terrainConfig: MapTerrainConfig = {
    ...level.terrain,
    seed: source.arena.seed,
  };
  const roadWidth = source.arena.roads?.width ?? level.roadWidth;
  const world = createArenaWorld(roadWaypoints(source), roadWidth);
  const baseTerrain = createTerrainSampler(terrainConfig);
  const roads = createRoadNetwork(world, baseTerrain);
  const terrain = gradeTerrain(baseTerrain, roads);
  const playerSpawn: MapPosition = [
    source.arena.playerSpawn.x,
    source.arena.playerSpawn.z,
  ];
  const structures = createStructures({
    locations: [...roads.locations.values()],
    roads,
    terrain,
    roadWidth,
    bound: source.arena.size / 2,
    spawnPoints: spawnPoints(source),
    seed: source.structureSeed,
  });
  const obstacles = createObstacles(
    source,
    terrain,
    roads,
    roadWidth,
    structures,
  );

  return {
    levelId,
    seed: source.arena.seed,
    size: source.arena.size,
    bound: source.arena.size / 2,
    obstacleDensity: source.arena.obstacleDensity,
    terrain,
    roads,
    roadWidth,
    chunks: chunkConfig(source.arena.size, level.chunks),
    obstacles: [...structures, ...obstacles],
    structures,
    playerSpawn,
    playerHeading:
      source.arena.heading ?? playerHeading(source.arena.playerSpawn),
  };
}
