import * as THREE from "three";
import type { Obstacle } from "@/lib/movement/movement.types";
import { intersectSegmentBox } from "@/lib/obstacles/obstacle-shape";

export const DEFAULT_ROCK_RADIUS = 4.5;
const OCCLUSION_EPSILON = 1e-3;

const segment = new THREE.Vector3();
const center = new THREE.Vector3();
const offset = new THREE.Vector3();

function rockCenter(out: THREE.Vector3, obstacle: Obstacle): THREE.Vector3 {
  const radius = obstacle.radius ?? DEFAULT_ROCK_RADIUS;
  return out.set(
    obstacle.position.x,
    obstacle.position.y + radius * 0.25,
    obstacle.position.z,
  );
}

export function intersectSegmentRock(
  from: Readonly<THREE.Vector3>,
  to: Readonly<THREE.Vector3>,
  obstacle: Obstacle,
): number | null {
  const boxT = intersectSegmentBox(from, to, obstacle);
  if (boxT !== null) return boxT;
  if (obstacle.shape === "box") return null;

  const radius = obstacle.radius ?? DEFAULT_ROCK_RADIUS;
  rockCenter(center, obstacle);
  segment.subVectors(to, from);
  const lengthSq = segment.lengthSq();
  if (lengthSq < 1e-12) return null;

  offset.subVectors(from, center);
  const c = offset.lengthSq() - radius * radius;
  if (c <= 0) return 0;

  const b = offset.dot(segment);
  const discriminant = b * b - lengthSq * c;
  if (discriminant < 0) return null;

  const t = (-b - Math.sqrt(discriminant)) / lengthSq;
  return t >= 0 && t <= 1 ? t : null;
}

export function earliestRockHit(
  from: Readonly<THREE.Vector3>,
  to: Readonly<THREE.Vector3>,
  obstacles: readonly Obstacle[],
): number | null {
  let best: number | null = null;
  for (const obstacle of obstacles) {
    const t = intersectSegmentRock(from, to, obstacle);
    if (t !== null && (best === null || t < best)) best = t;
  }
  return best;
}

export function isRockOccluded(
  from: Readonly<THREE.Vector3>,
  to: Readonly<THREE.Vector3>,
  obstacles: readonly Obstacle[],
): boolean {
  for (const obstacle of obstacles) {
    const t = intersectSegmentRock(from, to, obstacle);
    if (t !== null && t > OCCLUSION_EPSILON && t < 1 - OCCLUSION_EPSILON) {
      return true;
    }
  }
  return false;
}

export function findBlockingObstacle(
  origin: Readonly<THREE.Vector3>,
  target: Readonly<THREE.Vector3>,
  obstacles: readonly Obstacle[],
): Obstacle | null {
  let blocker: Obstacle | null = null;
  let earliest = Number.POSITIVE_INFINITY;
  for (const obstacle of obstacles) {
    if (obstacle.destructible) continue;
    const t = intersectSegmentRock(origin, target, obstacle);
    if (
      t !== null &&
      t > OCCLUSION_EPSILON &&
      t < 1 - OCCLUSION_EPSILON &&
      t < earliest
    ) {
      earliest = t;
      blocker = obstacle;
    }
  }
  return blocker;
}

export function hasLineOfSight(
  origin: Readonly<THREE.Vector3>,
  target: Readonly<THREE.Vector3>,
  obstacles: readonly Obstacle[],
): boolean {
  return findBlockingObstacle(origin, target, obstacles) === null;
}
