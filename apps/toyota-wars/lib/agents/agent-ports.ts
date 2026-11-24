import * as THREE from "three";
import type { AgentContext, AgentPorts, AgentVec3 } from "@toyota/agents";
import { MOVEMENT_CONFIG } from "@/lib/movement/movement.config";
import { distanceXZ, offsetFromHeading } from "@/lib/movement/movement.math";
import {
  MovementOrders,
  type MovementOrder,
  type Obstacle,
  type TankLeader,
} from "@/lib/movement/movement.types";
import { SQUAD_DIRECTIVE } from "@/lib/squad/squad.types";
import {
  findFiringRepositionPoint,
  type RepositionRequest,
} from "@/lib/tactics/tactics.reposition";

const scratch = new THREE.Vector3();
const waypoint = new THREE.Vector3();
const IDLE: MovementOrder = { type: MovementOrders.Idle };

function toVector3(point: AgentVec3): THREE.Vector3 {
  return new THREE.Vector3(point.x, point.y, point.z);
}

function resolveFormationMovement(
  ctx: AgentContext,
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

export const agentPorts: AgentPorts = {
  resolveFormationMovement(context: AgentContext, arriveRadius, slowRadius) {
    return resolveFormationMovement(context, arriveRadius, slowRadius);
  },
  findFiringRepositionPoint(request) {
    const appRequest: RepositionRequest = {
      ...request,
      origin: toVector3(request.origin),
      target: toVector3(request.target),
      blockingObstacle: request.blockingObstacle as Obstacle | null,
      obstacles: request.obstacles as Obstacle[],
    };
    const found = findFiringRepositionPoint(appRequest, waypoint);
    if (!found) return null;
    return { x: waypoint.x, y: waypoint.y, z: waypoint.z };
  },
};
