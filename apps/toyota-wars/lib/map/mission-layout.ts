import { TEAM } from "@/lib/missions/definition/mission.constants";
import type {
  MissionInput,
  Vec2,
} from "@/lib/missions/definition/mission.types";
import { createRng, scatterPoints } from "./map.spawns";

const AXES = [
  { x: 0, z: 1 },
  { x: 1, z: 0 },
  { x: 0, z: -1 },
  { x: -1, z: 0 },
] as const;

const EDGE_MARGIN = 75;
const LATERAL_JITTER = 55;
const CLUSTER_RADIUS = 58;
const SPAWN_BOUND_MARGIN = 16;
const SPAWN_ZONE_CLEARANCE = 18;
const SPAWN_ROUTE_CLEARANCE = 18;
const MIN_SPAWN_SEPARATION = 30;
const DEFAULT_ROAD_WIDTH = 24;
const ROAD_BOUND_MARGIN = 12;
const ROAD_ANCHOR_JITTER = 14;
const ROAD_ANCHOR_MIN_SEPARATION = 30;
const ROAD_BEND = 80;

function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function distance(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function distanceToSegmentXZ(point: Vec2, a: Vec2, b: Vec2): number {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const lengthSq = dx * dx + dz * dz;
  if (lengthSq === 0) return distance(point, a);
  const t = Math.max(
    0,
    Math.min(1, ((point.x - a.x) * dx + (point.z - a.z) * dz) / lengthSq),
  );
  return Math.hypot(point.x - (a.x + dx * t), point.z - (a.z + dz * t));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function average(points: readonly Vec2[], fallback: Vec2): Vec2 {
  if (points.length === 0) return fallback;
  let x = 0;
  let z = 0;
  for (const point of points) {
    x += point.x;
    z += point.z;
  }
  return { x: x / points.length, z: z / points.length };
}

function toVec2(point: readonly [number, number]): Vec2 {
  return { x: point[0], z: point[1] };
}

function squadSpawnCount(squad: MissionInput["squads"][number]): number {
  return Math.max(squad.units.length, squad.spawnPoints.length, 1);
}

export function applyMissionLayout(mission: MissionInput): MissionInput {
  const seed = (hashString(mission.id) ^ mission.arena.seed) >>> 0;
  const rng = createRng(seed);
  const axis = AXES[mission.order % AXES.length];
  const half = mission.arena.size / 2;
  const edge = half - EDGE_MARGIN;
  const lateral = (rng() - 0.5) * 2 * LATERAL_JITTER;

  const friendlyCenter: Vec2 = {
    x: axis.x === 0 ? lateral : axis.x * edge,
    z: axis.z === 0 ? lateral : axis.z * edge,
  };
  const enemyCenter: Vec2 = {
    x: axis.x === 0 ? lateral : -axis.x * edge,
    z: axis.z === 0 ? lateral : -axis.z * edge,
  };

  const zones = mission.zones ?? [];
  const routes = mission.squads.flatMap((squad) =>
    squad.route && squad.route.length > 1 ? [squad.route] : [],
  );

  const isValidSpawn = (
    x: number,
    z: number,
    reserved: readonly Vec2[] = [],
  ): boolean => {
    if (
      Math.abs(x) > half - SPAWN_BOUND_MARGIN ||
      Math.abs(z) > half - SPAWN_BOUND_MARGIN
    ) {
      return false;
    }
    const point = { x, z };
    if (
      reserved.some((other) => distance(point, other) < MIN_SPAWN_SEPARATION)
    ) {
      return false;
    }
    if (
      zones.some(
        (zone) =>
          distance(point, zone.position) < zone.radius + SPAWN_ZONE_CLEARANCE,
      )
    ) {
      return false;
    }
    return !routes.some((route) =>
      route.some(
        (waypoint, index) =>
          index > 0 &&
          distanceToSegmentXZ(point, route[index - 1], waypoint) <
            SPAWN_ROUTE_CLEARANCE,
      ),
    );
  };

  const friendlyCount =
    1 +
    mission.squads
      .filter((squad) => squad.team === TEAM.ALLY)
      .reduce((total, squad) => total + squadSpawnCount(squad), 0);
  const friendlyPoints = scatterPoints({
    rng,
    center: [friendlyCenter.x, friendlyCenter.z],
    radius: CLUSTER_RADIUS,
    count: friendlyCount,
    minSeparation: MIN_SPAWN_SEPARATION,
    isValid: isValidSpawn,
  });
  const playerPoint = toVec2(
    friendlyPoints[0] ?? [friendlyCenter.x, friendlyCenter.z],
  );

  const authoredIndices = new Set(
    mission.squads
      .map((squad, index) => ({ squad, index }))
      .filter(
        ({ squad }) =>
          squad.team === TEAM.ENEMY && squad.spawnLayout === "authored",
      )
      .map(({ index }) => index),
  );
  const authoredSourcePoints = mission.squads.flatMap((squad, index) =>
    authoredIndices.has(index) ? squad.spawnPoints : [],
  );
  const authoredSourceCenter = average(authoredSourcePoints, enemyCenter);
  const authoredAngle = Math.atan2(
    mission.arena.playerSpawn.x - authoredSourceCenter.x,
    mission.arena.playerSpawn.z - authoredSourceCenter.z,
  );
  const generatedAngle = Math.atan2(
    playerPoint.x - enemyCenter.x,
    playerPoint.z - enemyCenter.z,
  );
  const rotation = generatedAngle - authoredAngle;
  const cosRotation = Math.cos(rotation);
  const sinRotation = Math.sin(rotation);

  const authoredPointsByIndex = new Map<number, Vec2[]>();
  for (const index of authoredIndices) {
    const squad = mission.squads[index];
    if (!squad) continue;
    authoredPointsByIndex.set(
      index,
      squad.spawnPoints.map((point) => {
        const dx = point.x - authoredSourceCenter.x;
        const dz = point.z - authoredSourceCenter.z;
        const rotated = {
          x: enemyCenter.x + dx * cosRotation + dz * sinRotation,
          z: enemyCenter.z - dx * sinRotation + dz * cosRotation,
        };
        return {
          x: clamp(
            rotated.x,
            -half + SPAWN_BOUND_MARGIN,
            half - SPAWN_BOUND_MARGIN,
          ),
          z: clamp(
            rotated.z,
            -half + SPAWN_BOUND_MARGIN,
            half - SPAWN_BOUND_MARGIN,
          ),
        };
      }),
    );
  }

  const reservedEnemyPoints = [...authoredPointsByIndex.values()].flat();
  const enemyCount = mission.squads
    .map((squad, index) => ({ squad, index }))
    .filter(
      ({ squad, index }) =>
        squad.team === TEAM.ENEMY && !authoredIndices.has(index),
    )
    .reduce((total, { squad }) => total + squadSpawnCount(squad), 0);
  const enemyPoints = scatterPoints({
    rng,
    center: [enemyCenter.x, enemyCenter.z],
    radius: CLUSTER_RADIUS,
    count: enemyCount,
    minSeparation: MIN_SPAWN_SEPARATION,
    isValid: (x, z) =>
      isValidSpawn(x, z, [playerPoint, ...reservedEnemyPoints]),
  });

  const allyPoints = friendlyPoints.slice(1);
  const cursors = { ally: 0, enemy: 0 };

  const squads = mission.squads.map((squad, index) => {
    const authoredPoints = authoredPointsByIndex.get(index);
    if (authoredPoints) return { ...squad, spawnPoints: authoredPoints };

    const isEnemy = squad.team === TEAM.ENEMY;
    const pool = isEnemy ? enemyPoints : allyPoints;
    const key = isEnemy ? "enemy" : "ally";
    const points: Vec2[] = [];

    for (
      let spawnIndex = 0;
      spawnIndex < squadSpawnCount(squad);
      spawnIndex += 1
    ) {
      const point = pool[cursors[key] + spawnIndex] ?? pool[pool.length - 1];
      points.push(
        point ? toVec2(point) : isEnemy ? enemyCenter : friendlyCenter,
      );
    }
    cursors[key] += points.length;

    return { ...squad, spawnPoints: points };
  });

  const enemySpawnCenter = average(
    squads
      .filter((squad) => squad.team === TEAM.ENEMY)
      .flatMap((squad) => squad.spawnPoints),
    enemyCenter,
  );
  const heading = Math.atan2(
    enemySpawnCenter.x - playerPoint.x,
    enemySpawnCenter.z - playerPoint.z,
  );

  const roadWidth = mission.arena.roads?.width ?? DEFAULT_ROAD_WIDTH;
  const roadLimit = half - roadWidth / 2 - ROAD_BOUND_MARGIN;
  const anchorPoint = (point: Vec2): Vec2 => ({
    x: clamp(
      point.x + (rng() - 0.5) * 2 * ROAD_ANCHOR_JITTER,
      -roadLimit,
      roadLimit,
    ),
    z: clamp(
      point.z + (rng() - 0.5) * 2 * ROAD_ANCHOR_JITTER,
      -roadLimit,
      roadLimit,
    ),
  });

  const interiorAnchors = [...zones]
    .sort(
      (a, b) =>
        distance(a.position, { x: 0, z: 0 }) -
        distance(b.position, { x: 0, z: 0 }),
    )
    .slice(0, 2)
    .map((zone) => anchorPoint(zone.position));

  for (const route of routes) {
    if (interiorAnchors.length >= 2) break;
    const waypoint = route[Math.floor(route.length / 2)];
    if (!waypoint) continue;
    const candidate = anchorPoint(waypoint);
    if (
      distance(candidate, playerPoint) < ROAD_ANCHOR_MIN_SEPARATION ||
      distance(candidate, enemySpawnCenter) < ROAD_ANCHOR_MIN_SEPARATION ||
      interiorAnchors.some(
        (anchor) => distance(anchor, candidate) < ROAD_ANCHOR_MIN_SEPARATION,
      )
    ) {
      continue;
    }
    interiorAnchors.push(candidate);
  }

  while (interiorAnchors.length < 2) {
    const fraction = (interiorAnchors.length + 1) / 3;
    const midpoint = {
      x:
        playerPoint.x +
        (enemySpawnCenter.x - playerPoint.x) * fraction -
        axis.z * (rng() - 0.5) * 2 * ROAD_BEND,
      z:
        playerPoint.z +
        (enemySpawnCenter.z - playerPoint.z) * fraction +
        axis.x * (rng() - 0.5) * 2 * ROAD_BEND,
    };
    interiorAnchors.push({
      x: clamp(midpoint.x, -roadLimit, roadLimit),
      z: clamp(midpoint.z, -roadLimit, roadLimit),
    });
  }

  const roadWaypoints = [playerPoint, ...interiorAnchors, enemySpawnCenter].map(
    (point) => ({
      x: clamp(point.x, -roadLimit, roadLimit),
      z: clamp(point.z, -roadLimit, roadLimit),
    }),
  );

  return {
    ...mission,
    arena: {
      ...mission.arena,
      seed,
      playerSpawn: playerPoint,
      heading,
      roads: {
        width: roadWidth,
        waypoints: roadWaypoints,
      },
    },
    squads,
  };
}
