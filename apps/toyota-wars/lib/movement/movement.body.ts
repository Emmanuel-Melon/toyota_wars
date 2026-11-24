// lib/movement/movement.body.ts
import * as THREE from "three";
import type {
  DriveCommand,
  MovementBody,
  Obstacle,
  TankBodyConfig,
} from "./movement.types";
import { MOVEMENT_CONFIG } from "./movement.config";
import type { TerrainSampler } from "../map/map.terrain";
import { RIDE_HEIGHT } from "@/lib/vehicles/ride-height";
import { headingToVector, shortestAngleDiff, wrapAngle } from "./movement.math";
import {
  resolveObstacleMotion,
  resolveObstacleOverlap,
  type ObstacleResolution,
} from "./movement.obstacles";

export type TankBodyWorld = {
  terrain: TerrainSampler;
  bound: number;
  obstacles?: readonly Obstacle[];
};

export type VehicleDamageModifiers = {
  maxSpeedFactor: number;
  accelerationFactor: number;
  turnRateFactor: number;
  tractionFactor: number;
};

export class KinematicTankBody implements MovementBody {
  private _position = new THREE.Vector3();
  private _heading = 0;
  private _speed = 0;
  private _throttleHold = 0;
  private _damageModifiers: VehicleDamageModifiers = {
    maxSpeedFactor: 1,
    accelerationFactor: 1,
    turnRateFactor: 1,
    tractionFactor: 1,
  };
  private _forward = new THREE.Vector3();
  private readonly _obstacleResolution: ObstacleResolution = {
    x: 0,
    z: 0,
    normalX: 0,
    normalZ: 0,
    hit: false,
  };
  public fuel: number;

  constructor(
    initialPosition: THREE.Vector3,
    private world: TankBodyWorld,
    initialHeading = 0,
    private config: TankBodyConfig = MOVEMENT_CONFIG.body,
  ) {
    this._position.copy(initialPosition);
    this.snapToGround();
    this._heading = initialHeading;
    this.fuel = this.config.fuel.maxFuel;
  }

  get position(): Readonly<THREE.Vector3> {
    return this._position;
  }

  get heading(): number {
    return this._heading;
  }

  get speed(): number {
    return this._speed;
  }

  get damageModifiers(): Readonly<VehicleDamageModifiers> {
    return this._damageModifiers;
  }

  setDamageModifiers(modifiers: VehicleDamageModifiers): void {
    this._damageModifiers = { ...modifiers };
  }

  /** Returns current speed in kilometers per hour (km/h) */
  get speedKmh(): number {
    return this._speed * 3.6;
  }

  /** Returns current speed in miles per hour (mph) */
  get speedMph(): number {
    return this._speed * 2.23694;
  }

  reset(position: THREE.Vector3, heading: number): void {
    this._position.copy(position);
    this.snapToGround();
    this._heading = heading;
    this._speed = 0;
    this._throttleHold = 0;
  }

  halt(): void {
    this._speed = 0;
    this._throttleHold = 0;
  }

  /** Offsets the body horizontally (e.g. collision separation) and re-snaps Y. */
  nudge(dx: number, dz: number): void {
    this._position.x += dx;
    this._position.z += dz;
    this.clampAndSnap();
  }

  step(command: DriveCommand, dt: number): void {
    const cfg = this.config;
    const damage = this._damageModifiers;
    const effectiveMaxSpeed = Math.max(
      0.1,
      cfg.maxSpeed * damage.maxSpeedFactor,
    );
    const speedRatio = Math.abs(this._speed) / effectiveMaxSpeed;
    const effectiveTurnRate =
      cfg.maxTurnRate * damage.turnRateFactor * (1 - speedRatio * 0.4);

    // 1. Heading / steering
    let align = 1;
    if (command.desiredHeading !== null) {
      // Autopilot: turn toward the desired heading by the shortest angle.
      const angleDiff = shortestAngleDiff(
        this._heading,
        command.desiredHeading,
      );
      const maxTurn = effectiveTurnRate * dt;
      const nextHeading =
        Math.abs(angleDiff) < maxTurn
          ? command.desiredHeading
          : this._heading + Math.sign(angleDiff) * maxTurn;
      this._heading = wrapAngle(nextHeading);
      align = Math.max(0, Math.cos(angleDiff));
    } else if (command.steer !== 0) {
      // Manual steering. Positive steer turns right.
      const steer = THREE.MathUtils.clamp(command.steer, -1, 1);
      this._heading = wrapAngle(this._heading - steer * effectiveTurnRate * dt);
    }

    // 2. Speed / throttle
    const speedFactor =
      cfg.minTurnSpeedFactor + (1 - cfg.minTurnSpeedFactor) * align * align;
    const forwardInput = Math.max(0, command.throttle);

    if (forwardInput > 0.01) {
      this._throttleHold = Math.min(
        1,
        this._throttleHold + dt / cfg.accelerationRampTime,
      );
    } else {
      this._throttleHold = 0;
    }

    const forwardLimit =
      cfg.minForwardSpeed +
      (effectiveMaxSpeed - cfg.minForwardSpeed) * this._throttleHold;
    const targetSpeed =
      command.throttle > 0
        ? Math.max(
            cfg.minForwardSpeed,
            forwardInput * forwardLimit * speedFactor,
          )
        : command.throttle < 0
          ? command.throttle *
            cfg.maxReverseSpeed *
            damage.maxSpeedFactor *
            speedFactor
          : 0;

    const slowing = Math.abs(targetSpeed) < Math.abs(this._speed);
    const reversing =
      this._speed !== 0 &&
      targetSpeed !== 0 &&
      Math.sign(targetSpeed) !== Math.sign(this._speed);

    let rate = cfg.acceleration;
    if (reversing) {
      rate = cfg.brakingDeceleration ?? cfg.deceleration * 1.8;
    } else if (slowing) {
      rate = cfg.deceleration;
    }
    rate *= damage.accelerationFactor * damage.tractionFactor;

    this._speed = THREE.MathUtils.damp(this._speed, targetSpeed, rate, dt);

    // 3. Integrate horizontal position
    const previousX = this._position.x;
    const previousZ = this._position.z;
    headingToVector(this._heading, this._forward);
    this._position.addScaledVector(this._forward, this._speed * dt);

    // 4. World bounds, obstacle collision, and terrain snap
    this.clampAndSnap(previousX, previousZ);

    const fuelCfg = cfg.fuel;

    if (this.fuel > 0) {
      const consumption =
        (Math.abs(command.throttle) > 0.01
          ? fuelCfg.consumptionRate * Math.abs(command.throttle)
          : fuelCfg.idleConsumptionRate) * dt;
      this.fuel = Math.max(0, this.fuel - consumption);
    } else {
      // Out of fuel: force throttle and speed to zero
      command.throttle = 0;
      this._speed = THREE.MathUtils.damp(
        this._speed,
        0,
        cfg.deceleration * 2,
        dt,
      );
    }
  }

  private clampAndSnap(previousX?: number, previousZ?: number): void {
    const bound = this.world.bound - this.config.radius;
    this._position.x = THREE.MathUtils.clamp(this._position.x, -bound, bound);
    this._position.z = THREE.MathUtils.clamp(this._position.z, -bound, bound);

    const obstacles = this.world.obstacles;
    if (obstacles && obstacles.length > 0) {
      const resolution = this._obstacleResolution;
      if (previousX !== undefined && previousZ !== undefined) {
        const hit = resolveObstacleMotion(
          previousX,
          previousZ,
          this._position.x,
          this._position.z,
          this.config.radius,
          obstacles,
          resolution,
        );
        this._position.x = resolution.x;
        this._position.z = resolution.z;

        if (hit) {
          const forwardX = Math.sin(this._heading);
          const forwardZ = Math.cos(this._heading);
          const intoObstacle =
            forwardX * resolution.normalX + forwardZ * resolution.normalZ;
          if (this._speed * intoObstacle < 0) this._speed *= 0.2;
        }
      } else {
        resolveObstacleOverlap(
          this._position.x,
          this._position.z,
          this.config.radius,
          obstacles,
          resolution,
        );
        this._position.x = resolution.x;
        this._position.z = resolution.z;
      }
    }

    this.snapToGround();
  }

  /** Terrain height plus ride clearance. */
  private snapToGround(): void {
    this._position.y =
      this.world.terrain.getHeight(this._position.x, this._position.z) +
      RIDE_HEIGHT;
  }
}

export function createTankBody(
  position: THREE.Vector3,
  heading: number,
  world: TankBodyWorld,
  config: Partial<TankBodyConfig> = {},
): KinematicTankBody {
  return new KinematicTankBody(position, world, heading, {
    ...MOVEMENT_CONFIG.body,
    ...config,
    radius: config.radius ?? MOVEMENT_CONFIG.body.radius,
  });
}
