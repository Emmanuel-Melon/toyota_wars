import * as THREE from "three";
import { getBallisticAdjustedTarget } from "../ballistics/aim-compensation";

export const MUZZLE_AIM_TOLERANCE = 0.04;

export type MuzzleBallistic = {
  speed: number;
  gravity: number;
  drag?: number;
};

const targetDirection = new THREE.Vector3();
const scratchPosition = new THREE.Vector3();
const scratchDirection = new THREE.Vector3();
const adjustedTarget = new THREE.Vector3();

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
  ballistic?: MuzzleBallistic,
): boolean {
  if (
    !target ||
    !readMuzzleTransform(muzzle, scratchPosition, scratchDirection)
  ) {
    return false;
  }
  const aimTarget = ballistic
    ? getBallisticAdjustedTarget(
        scratchPosition,
        target,
        ballistic.speed,
        ballistic.gravity,
        adjustedTarget,
        ballistic.drag,
      )
    : target;
  targetDirection.subVectors(aimTarget, scratchPosition);
  if (targetDirection.lengthSq() < 1e-8) return false;
  targetDirection.normalize();
  return scratchDirection.dot(targetDirection) >= Math.cos(tolerance);
}
