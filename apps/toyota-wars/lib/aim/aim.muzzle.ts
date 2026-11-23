// apps/toyota-wars/lib/aim/aim.muzzle.ts
import * as THREE from "three";

export const MUZZLE_AIM_TOLERANCE = 0.02;

const targetDirection = new THREE.Vector3();
const scratchPosition = new THREE.Vector3();
const scratchDirection = new THREE.Vector3();

export function readMuzzleTransform(
  muzzle: THREE.Object3D | null | undefined,
  outPosition: THREE.Vector3,
  outDirection: THREE.Vector3,
): boolean {
  if (!muzzle) return false;
  muzzle.updateWorldMatrix(true, false);
  muzzle.getWorldPosition(outPosition);
  muzzle.getWorldDirection(outDirection);
  return outDirection.lengthSq() > 1e-6;
}

export function isMuzzleAimedAt(
  muzzle: THREE.Object3D | null | undefined,
  target: Readonly<THREE.Vector3> | null | undefined,
  tolerance = MUZZLE_AIM_TOLERANCE,
): boolean {
  if (
    !target ||
    !readMuzzleTransform(muzzle, scratchPosition, scratchDirection)
  ) {
    return false;
  }
  targetDirection.subVectors(target, scratchPosition);
  if (targetDirection.lengthSq() < 1e-8) return false;
  targetDirection.normalize();
  return scratchDirection.dot(targetDirection) >= Math.cos(tolerance);
}
