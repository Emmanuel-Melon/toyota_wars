import * as THREE from "three";
import type { Obstacle } from "@/lib/movement/movement.types";
import {
  DEFAULT_ROCK_RADIUS,
  closestObstacleSurface,
  segmentTouchesObstacleXZ,
  type ObstacleSurface,
} from "@toyota/combat";

const TAU = Math.PI * 2;
const surface: ObstacleSurface = {
  x: 0,
  z: 0,
  normalX: 0,
  normalZ: 0,
  distance: 0,
};

export function obstacleRadius(obstacle: Obstacle): number {
  return obstacle.radius ?? DEFAULT_ROCK_RADIUS;
}

export function wrapAngle(angle: number): number {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}

export function clamp01(value: number): number {
  return THREE.MathUtils.clamp(value, 0, 1);
}

export function surfaceClearance(
  x: number,
  z: number,
  obstacles: readonly Obstacle[],
): number {
  let nearest = Number.POSITIVE_INFINITY;
  for (const obstacle of obstacles) {
    closestObstacleSurface(obstacle, x, z, surface);
    nearest = Math.min(nearest, surface.distance);
  }
  return nearest;
}

export function isPositionClear(
  x: number,
  z: number,
  obstacles: readonly Obstacle[],
  totalClearance: number,
): boolean {
  for (const obstacle of obstacles) {
    closestObstacleSurface(obstacle, x, z, surface);
    if (surface.distance <= totalClearance) return false;
  }
  return true;
}

export function isPathClear(
  fromX: number,
  fromZ: number,
  toX: number,
  toZ: number,
  obstacles: readonly Obstacle[],
  totalClearance: number,
): boolean {
  for (const obstacle of obstacles) {
    if (
      segmentTouchesObstacleXZ(obstacle, fromX, fromZ, toX, toZ, totalClearance)
    ) {
      return false;
    }
  }
  return true;
}

export function pointOnArc(
  centerX: number,
  centerZ: number,
  radius: number,
  angle: number,
  out: { x: number; z: number },
): { x: number; z: number } {
  out.x = centerX + Math.cos(angle) * radius;
  out.z = centerZ + Math.sin(angle) * radius;
  return out;
}

export const FULL_CIRCLE = TAU;
