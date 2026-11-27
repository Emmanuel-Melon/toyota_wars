// packages/combat/src/ballistics/spread.ts
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