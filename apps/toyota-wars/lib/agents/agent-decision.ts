import * as THREE from "three";
import type {
  AgentDecision,
  AgentLeader,
  AgentThreat,
  AgentVec3,
  AgentWeaponOrder,
} from "@toyota/agents";
import {
  MovementOrders,
  type MovementOrder,
  type TankDecision,
  type TankLeader,
  type TankThreat,
} from "@/lib/movement/movement.types";
import type { WeaponOrder } from "@/lib/weapons/weapon.types";

function toVector3(point: AgentVec3): THREE.Vector3 {
  return new THREE.Vector3(point.x, point.y, point.z);
}

function toThreat(threat: AgentThreat): TankThreat {
  return {
    ...threat,
    position: toVector3(threat.position),
  };
}

function toLeader(leader: AgentLeader): TankLeader {
  return {
    ...leader,
    position: toVector3(leader.position),
  };
}

function toMovementOrder(order: AgentDecision["movement"]): MovementOrder {
  switch (order.type) {
    case MovementOrders.Idle:
      return { type: MovementOrders.Idle };
    case MovementOrders.Face:
      return { type: MovementOrders.Face, point: toVector3(order.point) };
    case MovementOrders.MoveTo:
      return {
        type: MovementOrders.MoveTo,
        point: toVector3(order.point),
        speed: order.speed,
        stopDistance: order.stopDistance,
        slowRadius: order.slowRadius,
      };
    case MovementOrders.Follow:
      return {
        type: MovementOrders.Follow,
        leader: toLeader(order.leader),
        offset: order.offset,
        arriveRadius: order.arriveRadius,
        slowRadius: order.slowRadius,
      };
    case MovementOrders.Flee:
      return {
        type: MovementOrders.Flee,
        threats: order.threats.map(toThreat),
        speed: order.speed,
      };
  }
}

function toWeaponOrder(order: AgentWeaponOrder): WeaponOrder {
  if (order.type === "hold") return { type: "hold" };
  return {
    type: "fireAt",
    point: toVector3(order.point),
    requireAlignment: order.requireAlignment,
  };
}

export function mapAgentDecision(decision: AgentDecision): TankDecision {
  return {
    movement: toMovementOrder(decision.movement),
    weapon: toWeaponOrder(decision.weapon),
  };
}
