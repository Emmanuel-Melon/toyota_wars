// lib/movement/movement.types.ts
import * as THREE from "three";
import type { WeaponOrder } from "@/lib/weapons/weapon.types";

export const MovementOrders = {
  Idle: "idle",
  Face: "face",
  MoveTo: "moveTo",
  Follow: "follow",
  Flee: "flee",
} as const;

/** Derived from the constants so the union and the constants can't drift. */
export type MovementOrderType =
  (typeof MovementOrders)[keyof typeof MovementOrders];

export interface VehicleState {
  readonly position: THREE.Vector3;
  readonly heading: number;
  readonly speed: number;
  fuel: number; // Current fuel level (e.g., 0 to 100)
}

export interface FuelConfig {
  maxFuel: number;
  consumptionRate: number; // Units per second at full throttle
  idleConsumptionRate: number; // Units per second while idling
}

export interface TankBodyConfig {
  fuel: FuelConfig;
  /** Minimum forward target speed while throttle is applied. */
  minForwardSpeed: number;
  maxSpeed: number;
  maxReverseSpeed: number;
  /** Seconds of continuous throttle to ramp from minForwardSpeed to maxSpeed. */
  accelerationRampTime: number;
  acceleration: number;
  deceleration: number;
  /** Stronger deceleration when throttle opposes travel (defaults to deceleration * 1.8). */
  brakingDeceleration?: number;
  /** Maximum rotation speed in radians per second */
  maxTurnRate: number;
  /** Never drop below this fraction of max speed while turning. */
  minTurnSpeedFactor: number;
  radius: number;
}

export interface DriveCommand {
  throttle: number;
  desiredHeading: number | null;
  steer: number;
}

export const IDLE_DRIVE: DriveCommand = Object.freeze({
  throttle: 0,
  desiredHeading: null,
  steer: 0,
});

export interface MovementBody extends VehicleState {
  step(command: DriveCommand, dt: number): void;
  reset(position: THREE.Vector3, heading: number): void;
  halt(): void;
}

/** A circular footprint on the XZ plane. Threats and obstacles share it. */
export type Disc = {
  position: Readonly<THREE.Vector3>;
  radius?: number;
  destructible?: boolean;
};
export type TankThreat = Disc;
export type Obstacle = Disc & {
  shape?: "box";
  halfWidth?: number;
  halfDepth?: number;
  yaw?: number;
  height?: number;
  structure?: "building" | "watchtower";
  locationId?: string;
};

export type TankLeader = {
  position: Readonly<THREE.Vector3>;
  heading: number;
  speed?: number;
};

export type MovementOrder =
  | { type: typeof MovementOrders.Idle }
  | {
      type: typeof MovementOrders.MoveTo;
      point: Readonly<THREE.Vector3>;
      speed?: number;
      stopDistance?: number;
      /** Opt-in: ramp throttle down between slowRadius and stopDistance. */
      slowRadius?: number;
    }
  | {
      type: typeof MovementOrders.Flee;
      threats: readonly TankThreat[];
      speed?: number;
    }
  | {
      type: typeof MovementOrders.Follow;
      leader: TankLeader;
      offset: readonly [number, number];
      arriveRadius?: number;
      slowRadius?: number;
    }
  | { type: typeof MovementOrders.Face; point: Readonly<THREE.Vector3> };

export interface TankDecision {
  movement: MovementOrder;
  weapon: WeaponOrder;
}

const IDLE_MOVEMENT: MovementOrder = { type: MovementOrders.Idle };
const HOLD_WEAPON: WeaponOrder = { type: "hold" };

export function createDecision(): TankDecision {
  return { movement: IDLE_MOVEMENT, weapon: HOLD_WEAPON };
}

export function resetDecision(decision: TankDecision): void {
  decision.movement = IDLE_MOVEMENT;
  decision.weapon = HOLD_WEAPON;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export interface FleeConfig {
  candidateCount: number;
  lookAhead: number;
  boundaryWeight: number;
  headingBias: number;
  coverSearchRadius: number;
  coverClearance: number;
  coverStopDistance: number;
}

export interface AvoidanceConfig {
  /** Influence radius for obstacles that don't specify their own. */
  defaultRadius: number;
  /** Extra clearance beyond an obstacle's physical radius where avoidance starts. */
  padding: number;
  /** Body radius used so the strongest push lands at physical contact. */
  bodyRadius: number;
  /**
   * Push weight relative to the (unit length) seek direction.
   * An obstacle touching the tank pushes with this strength; it falls
   * off linearly to 0 at the obstacle's influence radius.
   */
  pushMultiplier: number;
  /** Sideways steering weight for obstacles ahead of the tank. */
  tangentMultiplier: number;
}

/** Fully-populated config: every field has a value. */
export interface ResolvedMovementConfig {
  stopDistance: number;
  arriveRadius: number;
  slowRadius: number;
  flee: FleeConfig;
  avoidance: AvoidanceConfig;
}

export interface WorldMovement {
  bound: number;
  obstacles: readonly Obstacle[];
  avoidance?: AvoidanceConfig;
  flee?: FleeConfig;
}

// ---------------------------------------------------------------------------
// Resolver plumbing
// ---------------------------------------------------------------------------

export interface MovementContext {
  state: VehicleState;
  world: WorldMovement;
  config: ResolvedMovementConfig;
  dt: number;
  steering: SteeringSolver;
  /** Reusable vector for handlers that need a temporary target. */
  scratch: THREE.Vector3;
}

export interface SteeringSolver {
  /**
   * Steer toward `point`, blending in obstacle avoidance.
   * Returns IDLE_DRIVE once within `stopDistance`.
   */
  steerToward(
    point: Readonly<THREE.Vector3>,
    ctx: MovementContext,
    throttle: number,
    stopDistance: number,
  ): DriveCommand;
}

export type MovementHandler<K extends MovementOrderType> = (
  order: Extract<MovementOrder, { type: K }>,
  ctx: MovementContext,
) => DriveCommand;

/** One handler per order type. Adding an order type without a handler is a compile error. */
export type MovementHandlers = {
  [K in MovementOrderType]: MovementHandler<K>;
};

export interface OrderResolver {
  resolve(
    order: MovementOrder,
    state: VehicleState,
    world: WorldMovement,
    dt: number,
  ): DriveCommand;
}
