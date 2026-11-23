import type { AgentVec3 } from "./geometry";

export const AgentMovementOrders = {
  Idle: "idle",
  Face: "face",
  MoveTo: "moveTo",
  Follow: "follow",
  Flee: "flee",
} as const;

export type AgentMovementOrderType =
  (typeof AgentMovementOrders)[keyof typeof AgentMovementOrders];

export const AgentWeaponOrders = {
  Hold: "hold",
  FireAt: "fireAt",
} as const;

export type AgentWeaponOrderType =
  (typeof AgentWeaponOrders)[keyof typeof AgentWeaponOrders];

export interface AgentThreat {
  readonly position: AgentVec3;
  readonly radius?: number;
  readonly destructible?: boolean;
}

export interface AgentLeader {
  readonly position: AgentVec3;
  readonly heading: number;
  readonly speed?: number;
}

export type AgentMovementOrder =
  | { type: typeof AgentMovementOrders.Idle }
  | { type: typeof AgentMovementOrders.Face; point: AgentVec3 }
  | {
      type: typeof AgentMovementOrders.MoveTo;
      point: AgentVec3;
      speed?: number;
      stopDistance?: number;
      slowRadius?: number;
    }
  | {
      type: typeof AgentMovementOrders.Follow;
      leader: AgentLeader;
      offset: readonly [number, number];
      arriveRadius?: number;
      slowRadius?: number;
    }
  | {
      type: typeof AgentMovementOrders.Flee;
      threats: readonly AgentThreat[];
      speed?: number;
    };

export type AgentWeaponOrder =
  | { type: typeof AgentWeaponOrders.Hold }
  | {
      type: typeof AgentWeaponOrders.FireAt;
      point: AgentVec3;
      requireAlignment?: boolean;
    };

export interface AgentDecision {
  movement: AgentMovementOrder;
  weapon: AgentWeaponOrder;
}

const IDLE_MOVEMENT: AgentMovementOrder = { type: AgentMovementOrders.Idle };
const HOLD_WEAPON: AgentWeaponOrder = { type: AgentWeaponOrders.Hold };

export function createAgentDecision(): AgentDecision {
  return { movement: IDLE_MOVEMENT, weapon: HOLD_WEAPON };
}

export function resetAgentDecision(decision: AgentDecision): void {
  decision.movement = IDLE_MOVEMENT;
  decision.weapon = HOLD_WEAPON;
}
