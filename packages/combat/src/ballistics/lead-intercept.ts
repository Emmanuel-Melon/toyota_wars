import * as THREE from "three";
import { calculateGravityDrop } from "./travel-time";

const EPSILON = 1e-6;
const MIN_SPEED = 1e-4;

const _relVel = new THREE.Vector3();
const _dispScaled = new THREE.Vector3();
const _adjustedDisp = new THREE.Vector3();

function solveInterceptTime(
  displacement: Readonly<THREE.Vector3>,
  targetVelocity: Readonly<THREE.Vector3>,
  projectileSpeed: number,
): number | null {
  if (!Number.isFinite(projectileSpeed) || projectileSpeed <= MIN_SPEED) {
    return null;
  }

  const distSq = displacement.lengthSq();
  if (distSq <= EPSILON * EPSILON) {
    return 0;
  }

  // Normalize by projectileSpeed so time units become distance/speed and
  // target speed becomes dimensionless ratio v_rel = v_target / v_proj.
  const invSpeed = 1 / projectileSpeed;
  _dispScaled.copy(displacement).multiplyScalar(invSpeed);
  _relVel.copy(targetVelocity).multiplyScalar(invSpeed);

  const vSq = _relVel.lengthSq();
  const dDotV = _dispScaled.dot(_relVel);
  const dSq = _dispScaled.lengthSq();

  // (|v|^2 - 1) * t^2 + 2 * (d . v) * t + |d|^2 = 0
  const a = vSq - 1;
  const b = 2 * dDotV;
  const c = dSq;

  if (Math.abs(a) <= EPSILON) {
    if (Math.abs(b) <= EPSILON) return null;
    const t = -c / b;
    return t > 0 ? t : null;
  }

  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) {
    return null;
  }

  const sqrtDisc = Math.sqrt(discriminant);
  const signB = b >= 0 ? 1 : -1;
  const q = -0.5 * (b + signB * sqrtDisc);

  if (Math.abs(q) <= 1e-12) {
    return null;
  }

  const t1 = q / a;
  const t2 = c / q;

  if (t1 > 0 && t2 > 0) return Math.min(t1, t2);
  if (t1 > 0) return t1;
  if (t2 > 0) return t2;
  return null;
}

export function solveInterceptTimeWithGravity(
  displacement: Readonly<THREE.Vector3>,
  targetVelocity: Readonly<THREE.Vector3>,
  projectileSpeed: number,
  gravity = 9.81,
  maxIterations = 4,
  tolerance = 1e-4,
): number | null {
  let t = solveInterceptTime(displacement, targetVelocity, projectileSpeed);
  if (t === null) return null;

  for (let i = 0; i < maxIterations; i++) {
    // Adjust vertical offset so the solver accounts for gravity over flight time t.
    // Flip '+' to '-' if your calculateGravityDrop returns a negative y offset.
    _adjustedDisp.copy(displacement);
    _adjustedDisp.y += calculateGravityDrop(t, gravity);

    const tNext = solveInterceptTime(
      _adjustedDisp,
      targetVelocity,
      projectileSpeed,
    );
    if (tNext === null) return t;
    if (Math.abs(tNext - t) < tolerance) return tNext;
    t = tNext;
  }

  return t;
}

export function calculatePredictedIntercept(
  muzzlePos: Readonly<THREE.Vector3>,
  targetPos: Readonly<THREE.Vector3>,
  targetVelocity: Readonly<THREE.Vector3>,
  muzzleSpeed: number,
  outIntercept: THREE.Vector3,
  gravity = 9.81,
  maxFlightTime = Infinity,
): THREE.Vector3 | null {
  _adjustedDisp.subVectors(targetPos, muzzlePos);

  const timeOfFlight = solveInterceptTimeWithGravity(
    _adjustedDisp,
    targetVelocity,
    muzzleSpeed,
    gravity,
  );

  if (timeOfFlight === null || timeOfFlight > maxFlightTime) {
    return null;
  }

  outIntercept.copy(targetPos).addScaledVector(targetVelocity, timeOfFlight);
  outIntercept.y += calculateGravityDrop(timeOfFlight, gravity);
  return outIntercept;
}