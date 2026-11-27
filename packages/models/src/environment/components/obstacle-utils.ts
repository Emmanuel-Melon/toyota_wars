// packages/models/src/environment/components/obstacle-utils.ts
import type { ObstacleVisual } from "../types";

export type CircleXZ = { x: number; z: number; radius: number };

export function getObstacleXZRadius(obstacle: ObstacleVisual): CircleXZ | null {
  const x = obstacle.position?.x ?? obstacle.x;
  const z = obstacle.position?.z ?? obstacle.z;
  if (typeof x !== "number" || typeof z !== "number") return null;
  const radius = typeof obstacle.radius === "number" ? obstacle.radius : 3;
  return { x, z, radius };
}