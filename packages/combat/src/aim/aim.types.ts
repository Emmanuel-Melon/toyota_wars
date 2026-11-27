// lib/aim/aim.types.ts
import * as THREE from "three";
import type { WeaponState } from "../weapons/weapon.types";
import type { WeaponTargetContext } from "../weapons/weapon.executor";

export type AimState = { x: number; y: number };

export type TurretAim = {
  yaw: number;
  pitch: number;
  distance: number;
  valid: boolean;
};

export type TurretAimLimits = {
  maxYaw: number;
  minPitch: number;
  maxPitch: number;
  yawSmoothing: number;
  pitchSmoothing: number;
  ballistic?: { speed: number; gravity: number; drag?: number };
};

export type AimingMode = "manual" | "auto";

export interface AimingStrategy {
  getDesiredHeading(
    state: WeaponState,
    context: WeaponTargetContext,
    manualInputAngle?: number,
  ): { heading: number; targetPoint: THREE.Vector3 | null };
}
