// lib/movement/movement.math.ts
import * as THREE from "three";

export const TAU = Math.PI * 2;

/** Anything with x/z, so Vector3s and plain scratch objects both work. */
export type PointXZ = { readonly x: number; readonly z: number };

export function distanceXZ(a: PointXZ, b: PointXZ): number {
  return Math.hypot(b.x - a.x, b.z - a.z);
}

export function headingTo(
  from: Readonly<THREE.Vector3>,
  to: Readonly<THREE.Vector3>,
): number {
  return Math.atan2(to.x - from.x, to.z - from.z);
}

export function wrapAngle(a: number): number {
  return Math.atan2(Math.sin(a), Math.cos(a));
}

export function shortestAngleDiff(from: number, to: number): number {
  return wrapAngle(to - from);
}

export function headingToVector(h: number, out: THREE.Vector3): THREE.Vector3 {
  return out.set(Math.sin(h), 0, Math.cos(h));
}

export function vectorToHeading(v: Readonly<THREE.Vector3>): number {
  return Math.atan2(v.x, v.z);
}

/**
 * Point `right` units to the right of and `forward` units ahead of `origin`,
 * in the frame of a body facing `heading`. Y is copied from origin.
 */
export function offsetFromHeading(
  origin: Readonly<THREE.Vector3>,
  heading: number,
  right: number,
  forward: number,
  out: THREE.Vector3,
): THREE.Vector3 {
  const s = Math.sin(heading);
  const c = Math.cos(heading);
  return out.set(
    origin.x + right * c + forward * s,
    origin.y,
    origin.z - right * s + forward * c,
  );
}

/**
 * Throttle factor in [0, 1]: 0 inside `arrive`, 1 beyond `slow`,
 * linear in between.
 */
export function arriveThrottle(
  dist: number,
  arrive: number,
  slow: number,
): number {
  if (dist <= arrive) return 0;
  const slowR = Math.max(arrive + 1e-3, slow);
  return dist < slowR ? (dist - arrive) / (slowR - arrive) : 1;
}
