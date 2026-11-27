import * as THREE from "three";
import {
  calculateGravityDrop,
  solveGravityAdjustedFlightTime,
} from "./travel-time";

const MIN_HORIZONTAL_DIST = 1e-4;

export function getBallisticAdjustedTarget(
  turretPosition: Readonly<THREE.Vector3>,
  rawTarget: Readonly<THREE.Vector3>,
  muzzleSpeed: number,
  gravity: number,
  out: THREE.Vector3,
  drag = 0,
  timeOfFlight?: number,
): THREE.Vector3 {
  const tof =
    timeOfFlight ??
    solveGravityAdjustedFlightTime(turretPosition, rawTarget, muzzleSpeed, {
      gravity,
      drag,
    });

  out.copy(rawTarget);
  out.y += calculateGravityDrop(tof, gravity);
  return out;
}

export function calculateBallisticPitch(
  origin: Readonly<THREE.Vector3>,
  target: Readonly<THREE.Vector3>,
  muzzleSpeed: number,
  gravity = 9.81,
  drag = 0,
): number {
  const horizontal = Math.hypot(target.x - origin.x, target.z - origin.z);
  if (horizontal <= MIN_HORIZONTAL_DIST) return 0;

  const tof = solveGravityAdjustedFlightTime(origin, target, muzzleSpeed, {
    gravity,
    drag,
  });
  const drop = calculateGravityDrop(tof, gravity);
  return Math.atan2(target.y + drop - origin.y, horizontal);
}