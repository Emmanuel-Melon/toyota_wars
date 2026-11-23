import * as THREE from "three";
import { MOVEMENT_CONFIG } from "../movement/movement.config";
import {
  MovementOrders,
  type MovementOrder,
  type TankLeader,
} from "../movement/movement.types";
import { distanceXZ, offsetFromHeading } from "../movement/movement.math";
import { SQUAD_DIRECTIVE } from "../squad/squad.types";
import type { TankContext } from "./tanks.types";

const scratch = new THREE.Vector3();
const IDLE: MovementOrder = { type: MovementOrders.Idle };

/**
 * Keep a follower on its formation slot while the leader moves.
 * Once the leader stops and the follower is near its slot, hold position
 * until the leader moves again. This avoids chasing a slot that rotates
 * with the stationary leader.
 */
export function resolveFormationMovement(
  ctx: TankContext,
  arriveRadius: number = MOVEMENT_CONFIG.follow.arriveRadius,
  slowRadius: number = MOVEMENT_CONFIG.follow.slowRadius,
): MovementOrder {
  const leader = ctx.leader as TankLeader | null;
  if (!leader) {
    ctx.formationState.standby = false;
    return IDLE;
  }

  const advancing =
    ctx.squadOrder.directive === SQUAD_DIRECTIVE.ADVANCE &&
    Boolean(ctx.targetPosition);
  if (advancing) {
    ctx.formationState.standby = false;
    return {
      type: MovementOrders.Follow,
      leader,
      offset: ctx.formationOffset,
      arriveRadius,
      slowRadius,
    };
  }

  const leaderSpeed = Math.abs(leader.speed ?? 0);
  if (leaderSpeed > MOVEMENT_CONFIG.follow.standbySpeed) {
    ctx.formationState.standby = false;
  } else if (!ctx.formationState.standby) {
    const [right, forward] = ctx.formationOffset;
    const target = offsetFromHeading(
      leader.position,
      leader.heading,
      right,
      forward,
      scratch,
    );
    if (
      distanceXZ(ctx.position, target) <=
      MOVEMENT_CONFIG.follow.standbyEnterRadius
    ) {
      ctx.formationState.standby = true;
    }
  }

  if (ctx.formationState.standby) return IDLE;

  return {
    type: MovementOrders.Follow,
    leader,
    offset: ctx.formationOffset,
    arriveRadius,
    slowRadius,
  };
}
