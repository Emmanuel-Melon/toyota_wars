import * as THREE from "three";
import type { Obstacle } from "@/lib/movement/movement.types";
import { hasLineOfSight } from "@toyota/combat";
import {
  FULL_CIRCLE,
  clamp01,
  isPathClear,
  isPositionClear,
  obstacleRadius,
  surfaceClearance,
  wrapAngle,
} from "./tactics.clearance";

const candidatePoint = new THREE.Vector3();

export type RepositionRequest = {
  origin: Readonly<THREE.Vector3>;
  target: Readonly<THREE.Vector3>;
  blockingObstacle: Obstacle | null;
  obstacles: readonly Obstacle[];
  optimalRange: number;
  bodyRadius: number;
  clearance: number;
  bound: number;
  sampleCount: number;
  heading: number;
};

function scoreCandidate(
  x: number,
  z: number,
  origin: Readonly<THREE.Vector3>,
  target: Readonly<THREE.Vector3>,
  heading: number,
  optimalRange: number,
  totalClearance: number,
  obstacles: readonly Obstacle[],
): number {
  const travel = Math.hypot(x - origin.x, z - origin.z);
  const travelScore = 1 - clamp01(travel / Math.max(optimalRange * 2, 1));
  const ringError =
    Math.abs(Math.hypot(x - target.x, z - target.z) - optimalRange) /
    Math.max(optimalRange, 1);
  const desiredHeading = Math.atan2(x - origin.x, z - origin.z);
  const headingError = Math.abs(wrapAngle(desiredHeading - heading)) / Math.PI;
  const clearanceScore = clamp01(
    surfaceClearance(x, z, obstacles) / Math.max(totalClearance, 1),
  );
  return (
    travelScore * 0.45 +
    (1 - clamp01(ringError)) * 0.25 +
    (1 - headingError) * 0.15 +
    clearanceScore * 0.15
  );
}

export function findFiringRepositionPoint(
  request: RepositionRequest,
  out: THREE.Vector3,
): boolean {
  const {
    origin,
    target,
    blockingObstacle,
    obstacles,
    optimalRange,
    bodyRadius,
    clearance,
    bound,
    heading,
  } = request;
  const sampleCount = Math.max(4, Math.floor(request.sampleCount));
  const totalClearance = bodyRadius + clearance;
  const playableBound = bound - bodyRadius;
  const baseAngle = Math.atan2(origin.z - target.z, origin.x - target.x);

  let bestScore = Number.NEGATIVE_INFINITY;
  let bestX = 0;
  let bestZ = 0;
  let found = false;

  for (let index = 0; index < sampleCount; index += 1) {
    const angle = baseAngle + (index / sampleCount) * FULL_CIRCLE;
    const x = target.x + Math.cos(angle) * optimalRange;
    const z = target.z + Math.sin(angle) * optimalRange;
    if (Math.abs(x) > playableBound || Math.abs(z) > playableBound) continue;
    if (!isPositionClear(x, z, obstacles, totalClearance)) continue;

    candidatePoint.set(x, origin.y, z);
    if (!hasLineOfSight(candidatePoint, target, obstacles)) continue;

    const score = scoreCandidate(
      x,
      z,
      origin,
      target,
      heading,
      optimalRange,
      totalClearance,
      obstacles,
    );
    if (score > bestScore) {
      bestScore = score;
      bestX = x;
      bestZ = z;
      found = true;
    }
  }

  if (!found) return false;

  if (
    isPathClear(origin.x, origin.z, bestX, bestZ, obstacles, totalClearance)
  ) {
    out.set(bestX, origin.y, bestZ);
    return true;
  }

  if (!blockingObstacle) return false;

  const center = blockingObstacle.position;
  const ringRadius = obstacleRadius(blockingObstacle) + totalClearance;
  const originAngle = Math.atan2(origin.z - center.z, origin.x - center.x);
  const candidateAngle = Math.atan2(bestZ - center.z, bestX - center.x);
  const delta = wrapAngle(candidateAngle - originAngle);
  const side = Math.abs(delta) < 1e-3 ? 1 : Math.sign(delta);
  const sweep =
    Math.abs(delta) < 1e-3
      ? Math.PI * 0.5
      : Math.min(Math.abs(delta), Math.PI * 0.75);
  const transitCount = Math.max(4, Math.floor(sampleCount / 4));

  let bestTransitScore = Number.NEGATIVE_INFINITY;
  let transitX = 0;
  let transitZ = 0;
  let transitFound = false;

  for (let index = 1; index <= transitCount; index += 1) {
    const angle = originAngle + side * sweep * (index / transitCount);
    const x = center.x + Math.cos(angle) * ringRadius;
    const z = center.z + Math.sin(angle) * ringRadius;
    if (Math.abs(x) > playableBound || Math.abs(z) > playableBound) continue;
    if (!isPositionClear(x, z, obstacles, totalClearance)) continue;
    if (!isPathClear(origin.x, origin.z, x, z, obstacles, totalClearance)) {
      continue;
    }

    const remaining =
      Math.abs(
        wrapAngle(candidateAngle - Math.atan2(z - center.z, x - center.x)),
      ) / Math.PI;
    const localClearance = clamp01(
      surfaceClearance(x, z, obstacles) / Math.max(totalClearance, 1),
    );
    const score = (1 - remaining) * 0.8 + localClearance * 0.2;
    if (score > bestTransitScore) {
      bestTransitScore = score;
      transitX = x;
      transitZ = z;
      transitFound = true;
    }
  }

  if (!transitFound) return false;
  out.set(transitX, origin.y, transitZ);
  return true;
}
