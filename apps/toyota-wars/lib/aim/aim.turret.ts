// lib/aim/aim.turret.ts
import * as THREE from "three";
import { getBallisticAdjustedTarget } from "../combat/combat.ballistics";
import { wrapAngle } from "../movement/movement.math";
import { dampAngle } from "./aim.math";
import type { TurretAim, TurretAimLimits } from "./aim.types";

const worldPosition = new THREE.Vector3();
const localTarget = new THREE.Vector3();
const localOrigin = new THREE.Vector3();
const adjustedTarget = new THREE.Vector3();
const aimDirection = new THREE.Vector3();
const scratchAim: TurretAim = {
  yaw: 0,
  pitch: 0,
  distance: 0,
  valid: false,
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function solveTurretAim(
  position: Readonly<THREE.Vector3>,
  hullHeading: number,
  target: Readonly<THREE.Vector3>,
  limits: TurretAimLimits,
  out: TurretAim = scratchAim,
): TurretAim {
  const aimTarget = limits.ballistic
    ? getBallisticAdjustedTarget(
        position,
        target,
        limits.ballistic.speed,
        limits.ballistic.gravity,
        adjustedTarget,
      )
    : target;

  aimDirection.subVectors(aimTarget, position);
  const distance = aimDirection.length();
  out.distance = distance;
  out.valid = distance > 1e-6;

  if (!out.valid) {
    out.yaw = 0;
    out.pitch = 0;
    return out;
  }

  const horizontal = Math.hypot(aimDirection.x, aimDirection.z);
  const worldYaw =
    horizontal > 1e-6 ? Math.atan2(aimDirection.x, aimDirection.z) : 0;
  const relativeYaw = wrapAngle(worldYaw - hullHeading);
  const elevation = Math.atan2(aimDirection.y, horizontal);

  out.yaw = clamp(relativeYaw, -limits.maxYaw, limits.maxYaw);
  out.pitch = clamp(-elevation, limits.minPitch, limits.maxPitch);
  return out;
}

export function applyTurretAim(
  yawGroup: THREE.Object3D,
  pitchGroup: THREE.Object3D,
  hullHeading: number,
  target: Readonly<THREE.Vector3> | null,
  limits: TurretAimLimits,
  delta: number,
  recoilOffset = 0,
  mountPitchOffset = 0,
  muzzle?: THREE.Object3D | null,
): void {
  let desiredYaw = 0;
  let desiredPitch = 0;
  const startYaw = yawGroup.rotation.y;
  const startPitch = pitchGroup.rotation.x;

  if (target) {
    const parent = yawGroup.parent;
    if (parent) {
      parent.updateWorldMatrix(true, true);
      for (let i = 0; i < 3; i++) {
        yawGroup.rotation.y = i === 0 ? startYaw : desiredYaw;
        pitchGroup.rotation.x =
          (i === 0 ? startPitch : desiredPitch) -
          recoilOffset -
          mountPitchOffset;
        yawGroup.updateWorldMatrix(true, true);
        if (muzzle) {
          muzzle.getWorldPosition(worldPosition);
          parent.worldToLocal(worldPosition);
        } else {
          worldPosition.copy(yawGroup.position);
        }
        localTarget.copy(target);
        parent.worldToLocal(localTarget);
        localTarget.sub(worldPosition);
        const aim = solveTurretAim(
          localOrigin,
          0,
          localTarget,
          limits,
          scratchAim,
        );
        if (aim.valid) {
          desiredYaw = aim.yaw;
          desiredPitch = aim.pitch;
        }
      }
      yawGroup.rotation.y = startYaw;
      pitchGroup.rotation.x = startPitch;
    } else {
      yawGroup.updateWorldMatrix(true, false);
      yawGroup.getWorldPosition(worldPosition);
      const aim = solveTurretAim(
        worldPosition,
        hullHeading,
        target,
        limits,
        scratchAim,
      );
      if (aim.valid) {
        desiredYaw = aim.yaw;
        desiredPitch = aim.pitch;
      }
    }
  }

  yawGroup.rotation.y = dampAngle(
    yawGroup.rotation.y,
    desiredYaw,
    limits.yawSmoothing,
    delta,
  );
  const targetPitch = desiredPitch - recoilOffset - mountPitchOffset;
  pitchGroup.rotation.x = THREE.MathUtils.damp(
    pitchGroup.rotation.x,
    targetPitch,
    limits.pitchSmoothing,
    delta,
  );
}
