// lib/aim/aim.types.ts
import * as THREE from "three";
import type { WeaponTargetContext } from "@/lib/weapons/weapon.executor";
import type { WeaponState } from "@/lib/weapons/weapon.types";

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
  ballistic?: { speed: number; gravity: number };
};

export type AimingMode = "manual" | "auto";

export interface AimingStrategy {
  getDesiredHeading(
    state: WeaponState,
    context: WeaponTargetContext,
    manualInputAngle?: number,
  ): { heading: number; targetPoint: THREE.Vector3 | null };
}
