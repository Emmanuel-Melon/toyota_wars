import type { WeaponConfig } from "../weapons/weapon.types";
import type { AimState, TurretAimLimits } from "./aim.types";

export const AIM_LIMIT = 0.6;
export const AIM_KEY_SPEED = 1.2;
export const AIM_START: AimState = { x: 0, y: 0 };

export const DEFAULT_FALLBACK_AIM_DISTANCE = 40;

export const BASE_TURRET_LIMITS: TurretAimLimits = {
  maxYaw: Math.PI,
  minPitch: -0.45,
  maxPitch: 0.45,
  yawSmoothing: 12,
  pitchSmoothing: 12,
};

/**
 * Dynamically builds turret aim limits and tracking parameters based on the equipped weapon profile.
 */
export function createTurretAimLimits(weapon: WeaponConfig): TurretAimLimits {
  const limits: TurretAimLimits = { ...BASE_TURRET_LIMITS };

  // Enable ballistic trajectory solving if the weapon has gravity parameters
  if (weapon.projectile.gravity) {
    limits.ballistic = {
      speed: weapon.projectile.speed,
      gravity: weapon.projectile.gravity,
    };
  }

  // Adjust tracking/smoothing and pitch bounds based on weapon mount type / mechanism
  if (weapon.mechanism === "rocket") {
    // Rockets require higher elevation arcs and slower, heavier aiming adjustment
    limits.minPitch = -0.1;
    limits.maxPitch = Math.PI * 0.4; // Allow steeper upward angles for indirect fire
    limits.yawSmoothing = 6; // Slower turret traversal for heavy rocket pods
    limits.pitchSmoothing = 6;
  } else if (weapon.id === "zu23") {
    // Fast-tracking twin autocannons
    limits.yawSmoothing = 16;
    limits.pitchSmoothing = 16;
  }

  return limits;
}
