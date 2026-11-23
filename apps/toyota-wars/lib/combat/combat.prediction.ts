// lib/combat/combat.prediction.ts
import * as THREE from "three";

export function calculatePredictedIntercept(
  muzzlePos: Readonly<THREE.Vector3>,
  targetPos: Readonly<THREE.Vector3>,
  targetVelocity: Readonly<THREE.Vector3>,
  muzzleSpeed: number,
  gravity = 9.81,
  iterations = 3,
  outIntercept: THREE.Vector3,
): THREE.Vector3 {
  outIntercept.copy(targetPos);

  if (muzzleSpeed <= 1e-4) return outIntercept;

  for (let i = 0; i < iterations; i++) {
    const dx = outIntercept.x - muzzlePos.x;
    const dy = outIntercept.y - muzzlePos.y;
    const dz = outIntercept.z - muzzlePos.z;
    const distance = Math.hypot(dx, dy, dz);
    const timeOfFlight = distance / muzzleSpeed;

    outIntercept.copy(targetPos).addScaledVector(targetVelocity, timeOfFlight);
    outIntercept.y += 0.5 * gravity * timeOfFlight * timeOfFlight;
  }

  return outIntercept;
}
