import * as THREE from "three";
import { isSmokeOccluded } from "../fx/fx.smoke";

export type TargetPosition =
  Readonly<THREE.Vector3> | readonly [number, number, number];

export function readTargetPosition(
  position: TargetPosition,
  out: THREE.Vector3,
): THREE.Vector3 {
  if ("x" in position) return out.copy(position);

  const [x, y, z] = position;
  return out.set(x, y, z);
}

export function isTargetVisible(
  from: Readonly<THREE.Vector3>,
  targetCenter: Readonly<THREE.Vector3>,
): boolean {
  return !isSmokeOccluded(from, targetCenter);
}

export function isWithinXZRange(
  from: Readonly<THREE.Vector3>,
  targetCenter: Readonly<THREE.Vector3>,
  range: number,
): boolean {
  const dx = targetCenter.x - from.x;
  const dz = targetCenter.z - from.z;
  return dx * dx + dz * dz <= range * range;
}

export function distanceXZ(
  from: Readonly<THREE.Vector3>,
  targetCenter: Readonly<THREE.Vector3>,
): number {
  return Math.hypot(targetCenter.x - from.x, targetCenter.z - from.z);
}

export function distance3D(
  from: Readonly<THREE.Vector3>,
  targetCenter: Readonly<THREE.Vector3>,
): number {
  return from.distanceTo(targetCenter);
}
