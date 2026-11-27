import * as THREE from "three";
import type { MissionArena } from "@toyota/missions";
import type { PlacedLocation, RoadNetwork } from "./map.network";
import { createRng } from "./map.spawns";
import type { TerrainSampler } from "./map.terrain";
import type { MapPosition } from "./map.types";
import { LOCATION_IDS, type LocationId } from "./map.world";

export type ArenaStructure = {
  id: string;
  locationId: LocationId;
  structure: "building" | "watchtower" | "checkpoint" | "base";
  position: THREE.Vector3;
  shape: "box";
  width: number;
  depth: number;
  height: number;
  yaw: number;
  halfWidth: number;
  halfDepth: number;
  radius: number;
  destructible: false;
};

export type StructurePlacementInput = {
  locations: readonly PlacedLocation[];
  roads: RoadNetwork;
  terrain: TerrainSampler;
  roadWidth: number;
  bound: number;
  spawnPoints: readonly MapPosition[];
  seed?: number;
  seedStructures?: readonly ArenaStructure[];
};

type Rng = ReturnType<typeof createRng>;

type RoadFrame = {
  normalX: number;
  normalZ: number;
  tangentX: number;
  tangentZ: number;
};

type StructureSpec = {
  id: string;
  structure: "building" | "watchtower" | "checkpoint" | "base";
  width: number;
  depth: number;
  height: number;
  along: number;
  row: number;
};

const ROAD_CLEARANCE = 4;
const STRUCTURE_SPACING = 3;
const SPAWN_CLEARANCE = 10;
const OTHER_LOCATION_CLEARANCE = 8;
const BOUND_CLEARANCE = 2;
const LATERAL_STEPS = [0, 4, 8, 12, 16];

function nearestRoadTangent(
  roads: RoadNetwork,
  x: number,
  z: number,
): { x: number; z: number } | null {
  let bestDistanceSq = Infinity;
  let tangentX = 1;
  let tangentZ = 0;

  for (const path of roads.paths) {
    for (let index = 0; index < path.count; index += 1) {
      const dx = x - path.x[index];
      const dz = z - path.z[index];
      const distanceSq = dx * dx + dz * dz;
      if (distanceSq >= bestDistanceSq) continue;
      bestDistanceSq = distanceSq;
      tangentX = path.dx[index];
      tangentZ = path.dz[index];
    }
  }

  const length = Math.hypot(tangentX, tangentZ);
  if (length < 1e-4) return null;
  return { x: tangentX / length, z: tangentZ / length };
}

function roadFrame(location: PlacedLocation, roads: RoadNetwork): RoadFrame {
  const roadTangent = nearestRoadTangent(roads, location.x, location.z);
  let normalX = location.siteOffset?.[0] ?? 0;
  let normalZ = location.siteOffset?.[1] ?? 0;
  let length = Math.hypot(normalX, normalZ);

  if (length < 1e-4) {
    if (roadTangent) {
      normalX = -roadTangent.z;
      normalZ = roadTangent.x;
    } else {
      normalX = 1;
      normalZ = 0;
    }
    length = Math.hypot(normalX, normalZ) || 1;
  }

  normalX /= length;
  normalZ /= length;

  let tangentX = normalZ;
  let tangentZ = -normalX;
  if (roadTangent && tangentX * roadTangent.x + tangentZ * roadTangent.z < 0) {
    tangentX = -tangentX;
    tangentZ = -tangentZ;
  }

  return { normalX, normalZ, tangentX, tangentZ };
}

function jitter(value: number, amount: number, rng: Rng | undefined): number {
  if (!rng) return value;
  return value + (rng() - 0.5) * 2 * amount;
}

function shuffled<T>(items: readonly T[], rng: Rng | undefined): T[] {
  const out = [...items];
  if (!rng) return out;
  for (let index = out.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(rng() * (index + 1));
    [out[index], out[swap]] = [out[swap], out[index]];
  }
  return out;
}

function structureSpecs(
  location: PlacedLocation,
  rng: Rng | undefined,
): StructureSpec[] {
  if (location.kind === "outpost") {
    return [
      {
        id: `${location.id}-watchtower`,
        structure: "watchtower",
        width: jitter(3.4, 0.35, rng),
        depth: jitter(3.4, 0.35, rng),
        height: jitter(7.2, 0.6, rng),
        along: jitter(0, 3, rng),
        row: 0,
      },
    ];
  }

  if (location.kind !== "town" && location.kind !== "base") return [];

  return Array.from({ length: 6 }, (_, index) => {
    const column = index % 3;
    const row = Math.floor(index / 3);
    return {
      id: `${location.id}-building-${index}`,
      structure: "building" as const,
      width: jitter(5.5 + (index % 3) * 1.2, 0.8, rng),
      depth: jitter(5.5 + ((index + 1) % 3) * 1.1, 0.8, rng),
      height: jitter(3.2 + (index % 2) * 1.3, 0.6, rng),
      along: jitter((column - 1) * 12, 2.5, rng),
      row,
    };
  });
}

function isCandidateValid(
  x: number,
  z: number,
  radius: number,
  location: PlacedLocation,
  placed: readonly ArenaStructure[],
  input: StructurePlacementInput,
): boolean {
  const { roads, bound, spawnPoints, roadWidth } = input;

  if (Math.abs(x) > bound - radius - BOUND_CLEARANCE) return false;
  if (roads.distanceToRoad(x, z) < roadWidth / 2 + radius + ROAD_CLEARANCE) {
    return false;
  }
  if (
    roads
      .locationsNear(x, z, radius + OTHER_LOCATION_CLEARANCE)
      .some((other) => other.id !== location.id)
  ) {
    return false;
  }
  if (
    spawnPoints.some(
      (spawn) =>
        Math.hypot(x - spawn[0], z - spawn[1]) < radius + SPAWN_CLEARANCE,
    )
  ) {
    return false;
  }
  if (
    placed.some(
      (structure) =>
        Math.hypot(x - structure.position.x, z - structure.position.z) <
        radius + structure.radius + STRUCTURE_SPACING,
    )
  ) {
    return false;
  }
  return true;
}

function placeStructure(
  spec: StructureSpec,
  location: PlacedLocation,
  placed: readonly ArenaStructure[],
  input: StructurePlacementInput,
  rng: Rng | undefined,
): ArenaStructure | null {
  const frame = roadFrame(location, input.roads);
  const halfWidth = spec.width / 2;
  const halfDepth = spec.depth / 2;
  const radius = Math.hypot(halfWidth, halfDepth);
  const baseLateral =
    input.roadWidth / 2 +
    radius +
    ROAD_CLEARANCE +
    1 +
    spec.row * (spec.depth + STRUCTURE_SPACING + 2);
  const yaw = Math.atan2(frame.tangentX, frame.tangentZ);

  for (const side of shuffled([1, -1], rng)) {
    for (const boost of shuffled(LATERAL_STEPS, rng)) {
      const lateral = baseLateral + boost;
      const x =
        location.x +
        frame.normalX * side * lateral +
        frame.tangentX * spec.along;
      const z =
        location.z +
        frame.normalZ * side * lateral +
        frame.tangentZ * spec.along;

      if (!isCandidateValid(x, z, radius, location, placed, input)) continue;

      return {
        id: spec.id,
        locationId: location.id,
        structure: spec.structure,
        position: new THREE.Vector3(x, input.terrain.getHeight(x, z), z),
        shape: "box",
        width: spec.width,
        depth: spec.depth,
        height: spec.height,
        yaw,
        halfWidth,
        halfDepth,
        radius,
        destructible: false,
      };
    }
  }

  return null;
}

function nearestLocationId(
  x: number,
  z: number,
  roads: RoadNetwork,
): LocationId {
  let nearest: LocationId = LOCATION_IDS.crossroads;
  let bestDistance = Infinity;
  for (const [id, location] of roads.locations) {
    const distance = Math.hypot(x - location.x, z - location.z);
    if (distance < bestDistance) {
      bestDistance = distance;
      nearest = id;
    }
  }
  return nearest;
}

export function createAuthoredStructures(
  authored: MissionArena["structures"],
  roads: RoadNetwork,
  terrain: TerrainSampler,
): ArenaStructure[] {
  return authored.map((entry) => {
    const halfWidth = entry.width / 2;
    const halfDepth = entry.depth / 2;
    const { x, z } = entry.position;
    return {
      id: entry.id,
      locationId: nearestLocationId(x, z, roads),
      structure: entry.structure,
      position: new THREE.Vector3(x, terrain.getHeight(x, z), z),
      shape: "box",
      width: entry.width,
      depth: entry.depth,
      height: entry.height,
      yaw: entry.yaw,
      halfWidth,
      halfDepth,
      radius: Math.hypot(halfWidth, halfDepth),
      destructible: false,
    };
  });
}

export function createStructures(
  input: StructurePlacementInput,
): ArenaStructure[] {
  const placed: ArenaStructure[] = [...(input.seedStructures ?? [])];
  const generated: ArenaStructure[] = [];
  const rng = input.seed === undefined ? undefined : createRng(input.seed);

  for (const location of input.locations) {
    for (const spec of structureSpecs(location, rng)) {
      const structure = placeStructure(spec, location, placed, input, rng);
      if (!structure) continue;
      placed.push(structure);
      generated.push(structure);
    }
  }

  return generated;
}
