import * as THREE from "three";

const worldUp = new THREE.Vector3(0, 1, 0);
const up = new THREE.Vector3();
const right = new THREE.Vector3();
const forward = new THREE.Vector3();

export function applyBulletSpread(
  muzzleDir: THREE.Vector3,
  spreadAngle: number,
  random: () => number = Math.random,
): THREE.Vector3 {
  if (spreadAngle === 0) return muzzleDir;

  forward.copy(muzzleDir).normalize();

  right.crossVectors(forward, worldUp);
  if (right.lengthSq() < 1e-6) {
    right.set(1, 0, 0);
  } else {
    right.normalize();
  }

  up.crossVectors(right, forward).normalize();

  const angle = random() * Math.PI * 2;
  const radius = Math.sqrt(random()) * spreadAngle;

  muzzleDir
    .copy(forward)
    .addScaledVector(right, Math.cos(angle) * radius)
    .addScaledVector(up, Math.sin(angle) * radius)
    .normalize();

  return muzzleDir;
}

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
    outIntercept.y += calculateGravityDrop(timeOfFlight, gravity);
  }

  return outIntercept;
}
