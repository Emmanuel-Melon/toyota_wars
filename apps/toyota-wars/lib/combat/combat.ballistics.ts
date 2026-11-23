// lib/combat/combat.ballistics.ts
import * as THREE from "three";

export function calculateTimeOfFlight(
  origin: Readonly<THREE.Vector3>,
  target: Readonly<THREE.Vector3>,
  muzzleSpeed: number,
): number {
  if (muzzleSpeed <= 1e-4) return 0;
  return Math.hypot(target.x - origin.x, target.z - origin.z) / muzzleSpeed;
}

export function calculateGravityDrop(
  timeOfFlight: number,
  gravity = 9.81,
): number {
  return 0.5 * gravity * timeOfFlight * timeOfFlight;
}

export function getBallisticAdjustedTarget(
  turretPosition: Readonly<THREE.Vector3>,
  rawTarget: Readonly<THREE.Vector3>,
  muzzleSpeed: number,
  gravity: number,
  out: THREE.Vector3,
): THREE.Vector3 {
  out.copy(rawTarget);
  const timeOfFlight = calculateTimeOfFlight(
    turretPosition,
    rawTarget,
    muzzleSpeed,
  );
  out.y += calculateGravityDrop(timeOfFlight, gravity);
  return out;
}

export function calculateBallisticPitch(
  origin: Readonly<THREE.Vector3>,
  target: Readonly<THREE.Vector3>,
  muzzleSpeed: number,
  gravity = 9.81,
): number {
  const horizontal = Math.hypot(target.x - origin.x, target.z - origin.z);
  if (horizontal <= 1e-4) return 0;

  const timeOfFlight = calculateTimeOfFlight(origin, target, muzzleSpeed);
  const drop = calculateGravityDrop(timeOfFlight, gravity);
  return Math.atan2(target.y + drop - origin.y, horizontal);
}
