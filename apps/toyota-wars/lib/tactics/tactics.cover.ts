import * as THREE from "three";
import type { Obstacle } from "@/lib/movement/movement.types";
import { findBlockingObstacle, hasLineOfSight } from "@toyota/combat";
import type { Point2D } from "@/lib/squad/squad.types";
import {
  FULL_CIRCLE,
  clamp01,
  isPathClear,
  isPositionClear,
  obstacleRadius,
  surfaceClearance,
  wrapAngle,
} from "./tactics.clearance";

export type CoverMember = {
  position: Readonly<THREE.Vector3>;
};

export type CoverPointRequest = {
  origin: Readonly<THREE.Vector3>;
  target: Readonly<THREE.Vector3>;
  cover: Obstacle;
  obstacles: readonly Obstacle[];
  bound: number;
  bodyRadius: number;
  clearance: number;
  sampleCount: number;
  side: -1 | 1;
};

const probe = new THREE.Vector3();

export function coverAxis(
  target: Readonly<THREE.Vector3>,
  cover: Obstacle,
  out: THREE.Vector3,
): THREE.Vector3 {
  out.set(cover.position.x - target.x, 0, cover.position.z - target.z);
  if (out.lengthSq() < 1e-8) out.set(0, 0, 1);
  return out.normalize();
}

export function flankVectorFor(
  target: Readonly<THREE.Vector3>,
  cover: Obstacle,
  side: -1 | 1,
  out: Point2D,
): Point2D {
  const axis = coverAxis(target, cover, probe);
  out.x = -axis.z * side;
  out.y = axis.x * side;
  return out;
}

function distanceToSegmentXZ(
  point: Readonly<THREE.Vector3>,
  start: Readonly<THREE.Vector3>,
  end: Readonly<THREE.Vector3>,
): number {
  const dx = end.x - start.x;
  const dz = end.z - start.z;
  const lengthSq = dx * dx + dz * dz;
  if (lengthSq <= 1e-8) return Math.hypot(point.x - start.x, point.z - start.z);
  const t = THREE.MathUtils.clamp(
    ((point.x - start.x) * dx + (point.z - start.z) * dz) / lengthSq,
    0,
    1,
  );
  return Math.hypot(point.x - (start.x + dx * t), point.z - (start.z + dz * t));
}

export function resolveCoverObstacle(
  members: readonly CoverMember[],
  target: Readonly<THREE.Vector3>,
  obstacles: readonly Obstacle[],
  searchRadius: number,
): Obstacle | null {
  const center = new THREE.Vector3();
  for (const member of members) center.add(member.position);
  center.multiplyScalar(1 / Math.max(1, members.length));

  const blockers = new Map<Obstacle, number>();
  for (const member of members) {
    const blocker = findBlockingObstacle(member.position, target, obstacles);
    if (!blocker) continue;
    blockers.set(blocker, (blockers.get(blocker) ?? 0) + 1);
  }

  let selected: Obstacle | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;
  for (const [obstacle, count] of blockers) {
    const distance = distanceToSegmentXZ(obstacle.position, target, center);
    const score = count * 100 - distance;
    if (score > bestScore) {
      bestScore = score;
      selected = obstacle;
    }
  }
  if (selected) return selected;

  for (const obstacle of obstacles) {
    if (obstacle.destructible) continue;
    const distance = distanceToSegmentXZ(obstacle.position, target, center);
    if (distance > searchRadius + obstacleRadius(obstacle)) continue;
    const score = -distance;
    if (score > bestScore) {
      bestScore = score;
      selected = obstacle;
    }
  }
  return selected;
}

function candidateValid(
  x: number,
  z: number,
  request: CoverPointRequest,
  totalClearance: number,
): boolean {
  const playableBound = request.bound - request.bodyRadius;
  if (Math.abs(x) > playableBound || Math.abs(z) > playableBound) return false;
  return isPositionClear(x, z, request.obstacles, totalClearance);
}

export function findPinPoint(
  request: CoverPointRequest,
  out: Point2D,
): boolean {
  const { origin, target, cover, obstacles } = request;
  const totalClearance = request.bodyRadius + request.clearance;
  if (
    hasLineOfSight(origin, target, obstacles) &&
    isPositionClear(origin.x, origin.z, obstacles, totalClearance)
  ) {
    out.x = origin.x;
    out.y = origin.z;
    return true;
  }

  const baseAngle = Math.atan2(
    target.z - cover.position.z,
    target.x - cover.position.x,
  );
  const radius = obstacleRadius(cover) + totalClearance + 1.5;
  const sampleCount = Math.max(4, Math.floor(request.sampleCount));
  let bestScore = Number.NEGATIVE_INFINITY;
  let found = false;

  for (let index = 0; index < sampleCount; index += 1) {
    const spread =
      -Math.PI * 0.45 + (index / (sampleCount - 1)) * Math.PI * 0.9;
    const angle = baseAngle + spread;
    const x = cover.position.x + Math.cos(angle) * radius;
    const z = cover.position.z + Math.sin(angle) * radius;
    if (!candidateValid(x, z, request, totalClearance)) continue;
    probe.set(x, origin.y, z);
    if (!hasLineOfSight(probe, target, obstacles)) continue;
    if (!isPathClear(origin.x, origin.z, x, z, obstacles, totalClearance)) {
      continue;
    }

    const sideAlignment = clamp01(1 - Math.abs(spread) / (Math.PI * 0.45));
    const sideBias = request.side === 1 ? spread : -spread;
    const travel = Math.hypot(x - origin.x, z - origin.z);
    const clearanceScore = clamp01(
      surfaceClearance(x, z, obstacles) / Math.max(totalClearance, 1),
    );
    const score =
      sideAlignment * 0.35 +
      clamp01(1 - sideBias / (Math.PI * 0.45)) * 0.2 +
      clamp01(1 - travel / Math.max(radius * 4, 1)) * 0.3 +
      clearanceScore * 0.15;
    if (score > bestScore) {
      bestScore = score;
      out.x = x;
      out.y = z;
      found = true;
    }
  }
  return found;
}

export function findFlankPoint(
  request: CoverPointRequest,
  out: Point2D,
): boolean {
  const { origin, target, cover, obstacles } = request;
  const totalClearance = request.bodyRadius + request.clearance;
  const axis = coverAxis(target, cover, probe);
  const facing = Math.atan2(-axis.z, -axis.x);
  const radius = obstacleRadius(cover) + totalClearance + 4;
  const sampleCount = Math.max(4, Math.floor(request.sampleCount));
  let bestScore = Number.NEGATIVE_INFINITY;
  let found = false;

  for (let index = 0; index < sampleCount; index += 1) {
    const spread =
      request.side *
      (Math.PI * 0.25 + (index / (sampleCount - 1)) * Math.PI * 0.55);
    const angle = facing + spread;
    const x = cover.position.x + Math.cos(angle) * radius;
    const z = cover.position.z + Math.sin(angle) * radius;
    if (!candidateValid(x, z, request, totalClearance)) continue;
    if (!isPathClear(origin.x, origin.z, x, z, obstacles, totalClearance)) {
      continue;
    }

    probe.set(x, origin.y, z);
    const hasFiringLane = hasLineOfSight(probe, target, obstacles);
    const travel = Math.hypot(x - origin.x, z - origin.z);
    const clearanceScore = clamp01(
      surfaceClearance(x, z, obstacles) / Math.max(totalClearance, 1),
    );
    const angleError = Math.abs(wrapAngle(spread)) / FULL_CIRCLE;
    const score =
      (hasFiringLane ? 0.5 : 0) +
      (1 - clamp01(travel / Math.max(radius * 4, 1))) * 0.25 +
      (1 - angleError * 2) * 0.15 +
      clearanceScore * 0.1;
    if (score > bestScore) {
      bestScore = score;
      out.x = x;
      out.y = z;
      found = true;
    }
  }
  return found;
}
