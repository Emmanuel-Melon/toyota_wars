// lib/movement/movement.config.ts
import type {
  ResolvedMovementConfig,
  TankBodyConfig,
  WorldMovement,
} from "./movement.types";

/** Single source of truth for all movement tuning. */
export const MOVEMENT_CONFIG = {
  body: {
    minForwardSpeed: 11.11, // 40 km/h minimum target while throttle is held
    maxSpeed: 38.89, // 140 km/h in meters per second
    maxReverseSpeed: 11.11, // 40 km/h in reverse
    accelerationRampTime: 10, // seconds of throttle to ramp from 40 to 140 km/h
    acceleration: 1.5,
    deceleration: 2,
    brakingDeceleration: 12,
    maxTurnRate: Math.PI * 0.8,
    minTurnSpeedFactor: 0.5,
    radius: 2.0,
    fuel: {
      maxFuel: 100,
      consumptionRate: 0,
      idleConsumptionRate: 0,
    },
  } satisfies TankBodyConfig,
  follow: {
    arriveRadius: 2, // inside this, stop and hold heading
    slowRadius: 8, // ramp throttle down over this distance
    fallbackLeaderHeading: Math.PI, // used until the leader first moves (assumes player faces -z at start)
    standbySpeed: 0.5, // leader speed below this counts as stationary
    standbyEnterRadius: 8, // enter standby within this distance of the formation slot
  },
  patrol: {
    radius: 14,
    pause: [1.5, 4] as const,
    arriveRadius: 2.5,
    giveUpAfter: 15,
  },
  flee: {
    candidateCount: 16,
    lookAhead: 30,
    boundaryWeight: 0.35,
    headingBias: 0.1,
    coverSearchRadius: 28,
    coverClearance: 1.5,
    coverStopDistance: 2.5,
  },
  avoidance: {
    defaultRadius: 4.5,
    padding: 6,
    bodyRadius: 2,
    pushMultiplier: 2,
    tangentMultiplier: 1.5,
  },
  chase: {
    standoffDistance: 12, // stop driving this close, keep aiming
  },
  reposition: {
    clearance: 2.5,
    sampleCount: 16,
    stopDistance: 2.5,
  },
  throttle: {
    default: 1,
    flee: 1,
    patrol: 0.25,
    chase: 0.7,
  },
  stopDistance: 1.5,
} as const;

/** Resolver defaults derived from the consolidated movement config. */
export const DEFAULT_MOVEMENT_CONFIG: ResolvedMovementConfig = {
  stopDistance: MOVEMENT_CONFIG.stopDistance,
  arriveRadius: MOVEMENT_CONFIG.follow.arriveRadius,
  slowRadius: MOVEMENT_CONFIG.follow.slowRadius,
  flee: MOVEMENT_CONFIG.flee,
  avoidance: MOVEMENT_CONFIG.avoidance,
};

export function createResolvedConfig(): ResolvedMovementConfig {
  return {
    ...DEFAULT_MOVEMENT_CONFIG,
    flee: { ...DEFAULT_MOVEMENT_CONFIG.flee },
    avoidance: { ...DEFAULT_MOVEMENT_CONFIG.avoidance },
  };
}

/**
 * Fill defaults for anything the world doesn't override.
 * Writes into `out` so it can run every tick without allocating.
 */
export function resolveMovementConfig(
  world: WorldMovement,
  out: ResolvedMovementConfig,
): ResolvedMovementConfig {
  out.stopDistance = DEFAULT_MOVEMENT_CONFIG.stopDistance;
  out.arriveRadius = DEFAULT_MOVEMENT_CONFIG.arriveRadius;
  out.slowRadius = DEFAULT_MOVEMENT_CONFIG.slowRadius;
  out.flee = world.flee ?? DEFAULT_MOVEMENT_CONFIG.flee;
  out.avoidance = world.avoidance ?? DEFAULT_MOVEMENT_CONFIG.avoidance;
  return out;
}
