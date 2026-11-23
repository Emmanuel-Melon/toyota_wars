import type { Obstacle } from "./movement.types";
import {
  closestObstacleSurface,
  sweepCircleAgainstObstacle,
  type ObstacleSurface,
  type ObstacleSweep,
} from "@/lib/obstacles/obstacle-shape";

export type ObstacleResolution = {
  x: number;
  z: number;
  normalX: number;
  normalZ: number;
  hit: boolean;
};

const EPSILON = 0.002;

export function resolveObstacleMotion(
  startX: number,
  startZ: number,
  endX: number,
  endZ: number,
  radius: number,
  obstacles: readonly Obstacle[],
  out: ObstacleResolution,
): boolean {
  const moveX = endX - startX;
  const moveZ = endZ - startZ;
  const sweep: ObstacleSweep = { t: 1, normalX: 0, normalZ: 0 };

  let earliest = 1;
  let hitX = endX;
  let hitZ = endZ;
  let hitNormalX = 0;
  let hitNormalZ = 0;
  let found = false;

  for (const obstacle of obstacles) {
    const obstacleRadius = obstacle.radius;
    if (obstacleRadius === undefined || obstacleRadius <= 0) continue;
    if (
      !sweepCircleAgainstObstacle(
        obstacle,
        startX,
        startZ,
        endX,
        endZ,
        radius,
        sweep,
      )
    ) {
      continue;
    }
    if (sweep.t >= earliest) continue;

    earliest = sweep.t;
    hitX = startX + moveX * sweep.t + sweep.normalX * EPSILON;
    hitZ = startZ + moveZ * sweep.t + sweep.normalZ * EPSILON;
    hitNormalX = sweep.normalX;
    hitNormalZ = sweep.normalZ;
    found = true;
  }

  out.x = found ? hitX : endX;
  out.z = found ? hitZ : endZ;
  out.normalX = hitNormalX;
  out.normalZ = hitNormalZ;
  out.hit = found;
  return found;
}

export function resolveObstacleOverlap(
  x: number,
  z: number,
  radius: number,
  obstacles: readonly Obstacle[],
  out: ObstacleResolution,
): boolean {
  out.x = x;
  out.z = z;
  out.normalX = 0;
  out.normalZ = 0;
  out.hit = false;

  const surface: ObstacleSurface = {
    x: 0,
    z: 0,
    normalX: 0,
    normalZ: 0,
    distance: 0,
  };

  for (let pass = 0; pass < 2; pass++) {
    let moved = false;

    for (const obstacle of obstacles) {
      const obstacleRadius = obstacle.radius;
      if (obstacleRadius === undefined || obstacleRadius <= 0) continue;

      closestObstacleSurface(obstacle, out.x, out.z, surface);
      if (surface.distance >= radius - EPSILON) continue;

      out.x = surface.x + surface.normalX * (radius + EPSILON);
      out.z = surface.z + surface.normalZ * (radius + EPSILON);
      out.normalX = surface.normalX;
      out.normalZ = surface.normalZ;
      out.hit = true;
      moved = true;
    }

    if (!moved) break;
  }

  return out.hit;
}
