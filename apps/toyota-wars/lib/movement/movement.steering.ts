// lib/movement/movement.steering.ts
import * as THREE from "three";
import {
  IDLE_DRIVE,
  type DriveCommand,
  type MovementContext,
  type SteeringSolver,
} from "@/lib/movement/movement.types";
import { GamaSteeringPilot } from "./movement.gama-pilot";
import { accumulateObstaclePush } from "./movement.avoidance";
import { distanceXZ, vectorToHeading } from "./movement.math";

/** Normalize a direction into a drive command, or idle if it has no length. */
export function toCommand(
  dir: THREE.Vector3 | null,
  throttle: number,
): DriveCommand {
  if (!dir || dir.lengthSq() < 1e-8) return IDLE_DRIVE;
  dir.normalize();
  return { throttle, desiredHeading: vectorToHeading(dir), steer: 0 };
}

/**
 * Composes the heading for "go toward a point": gama seek (unit direction)
 * plus weighted obstacle push, then hands the result to the body as a
 * desired heading.
 */
export class AvoidanceSteeringSolver implements SteeringSolver {
  private readonly _dir = new THREE.Vector3();
  private readonly _pilot = new GamaSteeringPilot();

  steerToward(
    point: Readonly<THREE.Vector3>,
    ctx: MovementContext,
    throttle: number,
    stopDistance: number,
  ): DriveCommand {
    const { state, world, config, dt } = ctx;
    if (distanceXZ(point, state.position) <= stopDistance) return IDLE_DRIVE;

    const dir = this._pilot.seekDirection(state.position, point, dt, this._dir);
    if (!dir) return IDLE_DRIVE;

    accumulateObstaclePush(
      dir,
      state.position,
      world.obstacles,
      config.avoidance,
    );
    return toCommand(dir, throttle);
  }
}
