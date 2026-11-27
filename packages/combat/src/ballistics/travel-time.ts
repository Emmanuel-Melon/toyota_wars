// packages/combat/src/ballistics/travel-time.ts
import * as THREE from "three";

const MIN_DRAG = 1e-8;
const MIN_SPEED = 1e-4;
const MIN_REMAINING_FACTOR = 1e-6;

export interface TrajectoryOptions {
  gravity?: number;
  drag?: number;
  maxIterations?: number;
  tolerance?: number;
}

function horizontalTravelTime(
  distance: number,
  muzzleSpeed: number,
  drag: number,
): number {
  if (
    !Number.isFinite(distance) ||
    distance <= 0 ||
    !Number.isFinite(muzzleSpeed) ||
    muzzleSpeed <= MIN_SPEED
  ) {
    return 0;
  }
  if (!Number.isFinite(drag) || drag <= MIN_DRAG) {
    return distance / muzzleSpeed;
  }

  const ratio = (drag * distance) / muzzleSpeed;
  if (!Number.isFinite(ratio) || ratio <= 0) return 0;
  if (ratio >= 1) {
    return -Math.log(MIN_REMAINING_FACTOR) / drag;
  }
  return -Math.log1p(-ratio) / drag;
}

export function calculateTimeOfFlight(
  origin: Readonly<THREE.Vector3>,
  target: Readonly<THREE.Vector3>,
  muzzleSpeed: number,
  drag = 0,
): number {
  return horizontalTravelTime(
    Math.hypot(target.x - origin.x, target.z - origin.z),
    muzzleSpeed,
    drag,
  );
}

export function calculateGravityDrop(
  timeOfFlight: number,
  gravity = 9.81,
): number {
  if (
    !Number.isFinite(timeOfFlight) ||
    timeOfFlight <= 0 ||
    !Number.isFinite(gravity)
  ) {
    return 0;
  }
  return 0.5 * gravity * timeOfFlight * timeOfFlight;
}

/**
 * Shared flight-time solver that accounts for gravity-shifted vertical target
 * position so pitch and lead calculations use the same vertical compensation.
 */
export function solveGravityAdjustedFlightTime(
  origin: Readonly<THREE.Vector3>,
  target: Readonly<THREE.Vector3>,
  muzzleSpeed: number,
  options: TrajectoryOptions = {},
): number {
  const {
    gravity = 9.81,
    drag = 0,
    maxIterations = 4,
    tolerance = 1e-4,
  } = options;

  let t = calculateTimeOfFlight(origin, target, muzzleSpeed, drag);
  if (t <= 0 || Math.abs(gravity) <= 1e-6) {
    return t;
  }

  const adjustedTarget = new THREE.Vector3();
  for (let i = 0; i < maxIterations; i++) {
    adjustedTarget.copy(target);
    adjustedTarget.y += calculateGravityDrop(t, gravity);

    const tNext = calculateTimeOfFlight(origin, adjustedTarget, muzzleSpeed, drag);
    if (tNext <= 0) return t;
    if (Math.abs(tNext - t) < tolerance) return tNext;
    t = tNext;
  }

  return t;
}