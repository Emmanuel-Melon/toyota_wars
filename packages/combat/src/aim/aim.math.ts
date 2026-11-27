// lib/aim/aim.math.ts
import * as THREE from "three";

export function headingTo(
  from: Readonly<THREE.Vector3>,
  to: Readonly<THREE.Vector3>,
): number {
  return Math.atan2(to.x - from.x, to.z - from.z);
}

export function wrapAngle(a: number): number {
  return Math.atan2(Math.sin(a), Math.cos(a));
}

export const aimHeading = headingTo;

export function alignmentError(
  currentHeading: number,
  desiredHeading: number,
): number {
  return wrapAngle(desiredHeading - currentHeading);
}

export function fallbackAimTarget(
  origin: Readonly<THREE.Vector3>,
  heading: number,
  distance: number,
  targetHeight: number,
  out: THREE.Vector3,
): THREE.Vector3 {
  return out.set(
    origin.x + Math.sin(heading) * distance,
    targetHeight,
    origin.z + Math.cos(heading) * distance,
  );
}

export function dampAngle(
  current: number,
  target: number,
  lambda: number,
  delta: number,
): number {
  const diff = wrapAngle(target - current);
  return wrapAngle(current + diff * (1 - Math.exp(-lambda * delta)));
}
