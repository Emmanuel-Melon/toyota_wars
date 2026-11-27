import * as THREE from "three";

export type Obstacle = {
  position: Readonly<THREE.Vector3>;
  radius?: number;
  destructible?: boolean;
  shape?: "box";
  halfWidth?: number;
  halfDepth?: number;
  yaw?: number;
  height?: number;
  structure?: "building" | "watchtower" | "checkpoint" | "base";
  locationId?: string;
};

export type ObstacleSurface = {
  x: number;
  z: number;
  normalX: number;
  normalZ: number;
  distance: number;
};

export type ObstacleSweep = {
  t: number;
  normalX: number;
  normalZ: number;
};

type BoxObstacle = Obstacle & {
  shape: "box";
  halfWidth: number;
  halfDepth: number;
  yaw?: number;
  height?: number;
};

const EPSILON = 1e-5;

function isBoxObstacle(obstacle: Obstacle): obstacle is BoxObstacle {
  return (
    obstacle.shape === "box" &&
    typeof obstacle.halfWidth === "number" &&
    typeof obstacle.halfDepth === "number"
  );
}

function yawOf(obstacle: BoxObstacle): number {
  return obstacle.yaw ?? 0;
}

function toLocalX(cos: number, sin: number, dx: number, dz: number): number {
  return cos * dx - sin * dz;
}

function toLocalZ(cos: number, sin: number, dx: number, dz: number): number {
  return sin * dx + cos * dz;
}

function toWorldX(cos: number, sin: number, lx: number, lz: number): number {
  return cos * lx + sin * lz;
}

function toWorldZ(cos: number, sin: number, lx: number, lz: number): number {
  return -sin * lx + cos * lz;
}

function localBoxSurface(
  localX: number,
  localZ: number,
  halfWidth: number,
  halfDepth: number,
): {
  x: number;
  z: number;
  normalX: number;
  normalZ: number;
  distance: number;
} {
  const clampedX = THREE.MathUtils.clamp(localX, -halfWidth, halfWidth);
  const clampedZ = THREE.MathUtils.clamp(localZ, -halfDepth, halfDepth);
  const outsideX = localX - clampedX;
  const outsideZ = localZ - clampedZ;
  const outsideDistance = Math.hypot(outsideX, outsideZ);

  if (outsideDistance > EPSILON) {
    return {
      x: clampedX,
      z: clampedZ,
      normalX: outsideX / outsideDistance,
      normalZ: outsideZ / outsideDistance,
      distance: outsideDistance,
    };
  }

  const marginX = halfWidth - Math.abs(localX);
  const marginZ = halfDepth - Math.abs(localZ);
  if (marginX <= marginZ) {
    const sign = localX >= 0 ? 1 : -1;
    return {
      x: sign * halfWidth,
      z: THREE.MathUtils.clamp(localZ, -halfDepth, halfDepth),
      normalX: sign,
      normalZ: 0,
      distance: -marginX,
    };
  }

  const sign = localZ >= 0 ? 1 : -1;
  return {
    x: THREE.MathUtils.clamp(localX, -halfWidth, halfWidth),
    z: sign * halfDepth,
    normalX: 0,
    normalZ: sign,
    distance: -marginZ,
  };
}

export function closestObstacleSurface(
  obstacle: Obstacle,
  x: number,
  z: number,
  out: ObstacleSurface,
): ObstacleSurface {
  const centerX = obstacle.position.x;
  const centerZ = obstacle.position.z;
  const dx = x - centerX;
  const dz = z - centerZ;

  if (isBoxObstacle(obstacle)) {
    const yaw = yawOf(obstacle);
    const cos = Math.cos(yaw);
    const sin = Math.sin(yaw);
    const surface = localBoxSurface(
      toLocalX(cos, sin, dx, dz),
      toLocalZ(cos, sin, dx, dz),
      obstacle.halfWidth,
      obstacle.halfDepth,
    );
    out.x = centerX + toWorldX(cos, sin, surface.x, surface.z);
    out.z = centerZ + toWorldZ(cos, sin, surface.x, surface.z);
    out.normalX = toWorldX(cos, sin, surface.normalX, surface.normalZ);
    out.normalZ = toWorldZ(cos, sin, surface.normalX, surface.normalZ);
    out.distance = surface.distance;
    return out;
  }

  const radius = Math.max(0, obstacle.radius ?? 0);
  const distance = Math.hypot(dx, dz);
  const normalX = distance > EPSILON ? dx / distance : 1;
  const normalZ = distance > EPSILON ? dz / distance : 0;
  out.x = centerX + normalX * radius;
  out.z = centerZ + normalZ * radius;
  out.normalX = normalX;
  out.normalZ = normalZ;
  out.distance = distance - radius;
  return out;
}

export function sweepCircleAgainstObstacle(
  obstacle: Obstacle,
  startX: number,
  startZ: number,
  endX: number,
  endZ: number,
  radius: number,
  out: ObstacleSweep,
): boolean {
  out.t = 1;
  out.normalX = 0;
  out.normalZ = 0;

  if (isBoxObstacle(obstacle)) {
    return sweepCircleAgainstBox(
      obstacle,
      startX,
      startZ,
      endX,
      endZ,
      radius,
      out,
    );
  }

  const obstacleRadius = obstacle.radius ?? 0;
  if (obstacleRadius <= 0) return false;

  const centerX = obstacle.position.x;
  const centerZ = obstacle.position.z;
  const moveX = endX - startX;
  const moveZ = endZ - startZ;
  const moveSq = moveX * moveX + moveZ * moveZ;
  const minDistance = radius + obstacleRadius;
  const fromX = startX - centerX;
  const fromZ = startZ - centerZ;
  const startDistanceSq = fromX * fromX + fromZ * fromZ;

  if (startDistanceSq < minDistance * minDistance - EPSILON) {
    out.t = 0;
    const distance = Math.sqrt(startDistanceSq);
    out.normalX = distance > EPSILON ? fromX / distance : -moveX || 1;
    out.normalZ = distance > EPSILON ? fromZ / distance : -moveZ;
    const length = Math.hypot(out.normalX, out.normalZ) || 1;
    out.normalX /= length;
    out.normalZ /= length;
    return true;
  }

  if (moveSq <= EPSILON) return false;

  const b = 2 * (fromX * moveX + fromZ * moveZ);
  const c = startDistanceSq - minDistance * minDistance;
  const discriminant = b * b - 4 * moveSq * c;
  if (discriminant < 0) return false;

  const t = (-b - Math.sqrt(discriminant)) / (2 * moveSq);
  if (t < 0 || t > 1) return false;

  const contactX = startX + moveX * t - centerX;
  const contactZ = startZ + moveZ * t - centerZ;
  const length = Math.hypot(contactX, contactZ) || 1;
  out.t = t;
  out.normalX = contactX / length;
  out.normalZ = contactZ / length;
  return true;
}

function sweepCircleAgainstBox(
  obstacle: BoxObstacle,
  startX: number,
  startZ: number,
  endX: number,
  endZ: number,
  radius: number,
  out: ObstacleSweep,
): boolean {
  const yaw = yawOf(obstacle);
  const cos = Math.cos(yaw);
  const sin = Math.sin(yaw);
  const centerX = obstacle.position.x;
  const centerZ = obstacle.position.z;
  const halfWidth = obstacle.halfWidth + Math.max(0, radius);
  const halfDepth = obstacle.halfDepth + Math.max(0, radius);
  const startLocalX = toLocalX(cos, sin, startX - centerX, startZ - centerZ);
  const startLocalZ = toLocalZ(cos, sin, startX - centerX, startZ - centerZ);
  const moveX = endX - startX;
  const moveZ = endZ - startZ;
  const moveLocalX = toLocalX(cos, sin, moveX, moveZ);
  const moveLocalZ = toLocalZ(cos, sin, moveX, moveZ);

  if (
    Math.abs(startLocalX) <= halfWidth + EPSILON &&
    Math.abs(startLocalZ) <= halfDepth + EPSILON
  ) {
    const surface = localBoxSurface(
      startLocalX,
      startLocalZ,
      halfWidth,
      halfDepth,
    );
    out.t = 0;
    out.normalX = toWorldX(cos, sin, surface.normalX, surface.normalZ);
    out.normalZ = toWorldZ(cos, sin, surface.normalX, surface.normalZ);
    return true;
  }

  let entry = 0;
  let exit = 1;
  let normalLocalX = 0;
  let normalLocalZ = 0;

  if (Math.abs(moveLocalX) < EPSILON) {
    if (startLocalX < -halfWidth || startLocalX > halfWidth) return false;
  } else {
    let t1 = (-halfWidth - startLocalX) / moveLocalX;
    let t2 = (halfWidth - startLocalX) / moveLocalX;
    const normal = moveLocalX > 0 ? -1 : 1;
    if (t1 > t2) [t1, t2] = [t2, t1];
    if (t1 > entry) {
      entry = t1;
      normalLocalX = normal;
      normalLocalZ = 0;
    }
    exit = Math.min(exit, t2);
    if (entry > exit) return false;
  }

  if (Math.abs(moveLocalZ) < EPSILON) {
    if (startLocalZ < -halfDepth || startLocalZ > halfDepth) return false;
  } else {
    let t1 = (-halfDepth - startLocalZ) / moveLocalZ;
    let t2 = (halfDepth - startLocalZ) / moveLocalZ;
    const normal = moveLocalZ > 0 ? -1 : 1;
    if (t1 > t2) [t1, t2] = [t2, t1];
    if (t1 > entry) {
      entry = t1;
      normalLocalX = 0;
      normalLocalZ = normal;
    }
    exit = Math.min(exit, t2);
    if (entry > exit) return false;
  }

  if (entry < 0 || entry > 1) return false;
  out.t = entry;
  out.normalX = toWorldX(cos, sin, normalLocalX, normalLocalZ);
  out.normalZ = toWorldZ(cos, sin, normalLocalX, normalLocalZ);
  return true;
}

export function segmentTouchesObstacleXZ(
  obstacle: Obstacle,
  fromX: number,
  fromZ: number,
  toX: number,
  toZ: number,
  padding: number,
): boolean {
  const surface = { x: 0, z: 0, normalX: 0, normalZ: 0, distance: 0 };
  closestObstacleSurface(obstacle, fromX, fromZ, surface);
  if (surface.distance <= padding) return true;

  if (!isBoxObstacle(obstacle)) {
    const radius = (obstacle.radius ?? 0) + padding;
    const moveX = toX - fromX;
    const moveZ = toZ - fromZ;
    const moveSq = moveX * moveX + moveZ * moveZ;
    if (moveSq <= EPSILON) return false;
    const fromLocalX = fromX - obstacle.position.x;
    const fromLocalZ = fromZ - obstacle.position.z;
    const b = 2 * (fromLocalX * moveX + fromLocalZ * moveZ);
    const c =
      fromLocalX * fromLocalX + fromLocalZ * fromLocalZ - radius * radius;
    const discriminant = b * b - 4 * moveSq * c;
    if (discriminant < 0) return false;
    const t = (-b - Math.sqrt(discriminant)) / (2 * moveSq);
    return t >= 0 && t <= 1;
  }

  const yaw = yawOf(obstacle);
  const cos = Math.cos(yaw);
  const sin = Math.sin(yaw);
  const centerX = obstacle.position.x;
  const centerZ = obstacle.position.z;
  const startLocalX = toLocalX(cos, sin, fromX - centerX, fromZ - centerZ);
  const startLocalZ = toLocalZ(cos, sin, fromX - centerX, fromZ - centerZ);
  const moveX = toX - fromX;
  const moveZ = toZ - fromZ;
  const moveLocalX = toLocalX(cos, sin, moveX, moveZ);
  const moveLocalZ = toLocalZ(cos, sin, moveX, moveZ);
  const halfWidth = obstacle.halfWidth + padding;
  const halfDepth = obstacle.halfDepth + padding;
  let entry = 0;
  let exit = 1;

  if (Math.abs(moveLocalX) < EPSILON) {
    if (startLocalX < -halfWidth || startLocalX > halfWidth) return false;
  } else {
    const t1 = (-halfWidth - startLocalX) / moveLocalX;
    const t2 = (halfWidth - startLocalX) / moveLocalX;
    entry = Math.max(entry, Math.min(t1, t2));
    exit = Math.min(exit, Math.max(t1, t2));
    if (entry > exit) return false;
  }

  if (Math.abs(moveLocalZ) < EPSILON) {
    if (startLocalZ < -halfDepth || startLocalZ > halfDepth) return false;
  } else {
    const t1 = (-halfDepth - startLocalZ) / moveLocalZ;
    const t2 = (halfDepth - startLocalZ) / moveLocalZ;
    entry = Math.max(entry, Math.min(t1, t2));
    exit = Math.min(exit, Math.max(t1, t2));
    if (entry > exit) return false;
  }

  return exit >= 0 && entry <= 1;
}

export function intersectSegmentBox(
  from: Readonly<THREE.Vector3>,
  to: Readonly<THREE.Vector3>,
  obstacle: Obstacle,
): number | null {
  if (!isBoxObstacle(obstacle)) return null;

  const yaw = yawOf(obstacle);
  const cos = Math.cos(yaw);
  const sin = Math.sin(yaw);
  const centerX = obstacle.position.x;
  const centerZ = obstacle.position.z;
  const startLocalX = toLocalX(cos, sin, from.x - centerX, from.z - centerZ);
  const startLocalZ = toLocalZ(cos, sin, from.x - centerX, from.z - centerZ);
  const moveX = to.x - from.x;
  const moveY = to.y - from.y;
  const moveZ = to.z - from.z;
  const moveLocalX = toLocalX(cos, sin, moveX, moveZ);
  const moveLocalZ = toLocalZ(cos, sin, moveX, moveZ);
  const bottom = obstacle.position.y;
  const top = bottom + (obstacle.height ?? Math.max(1, obstacle.radius ?? 4));

  let entry = 0;
  let exit = 1;

  const axes = [
    [startLocalX, moveLocalX, -obstacle.halfWidth, obstacle.halfWidth],
    [startLocalZ, moveLocalZ, -obstacle.halfDepth, obstacle.halfDepth],
    [from.y - bottom, moveY, 0, top - bottom],
  ] as const;

  for (const [start, delta, min, max] of axes) {
    if (Math.abs(delta) < EPSILON) {
      if (start < min || start > max) return null;
      continue;
    }
    const t1 = (min - start) / delta;
    const t2 = (max - start) / delta;
    entry = Math.max(entry, Math.min(t1, t2));
    exit = Math.min(exit, Math.max(t1, t2));
    if (entry > exit) return null;
  }

  return entry <= 1 && exit >= 0 ? entry : null;
}
