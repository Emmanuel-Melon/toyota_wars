// packages/agents/src/contracts/decision.ts
import { AgentMovementOrders, AgentWeaponOrders } from "../agents.config";
import type {
  AgentDecision,
  AgentMovementOrder,
  AgentWeaponOrder,
} from "../agent.types";

/**
 * ============================================================================
 * Default Order Singletons & Decision Lifecycle Helpers
 * ============================================================================
 * Shared default order objects and allocation-free helpers for creating
 * and resetting per-tick `AgentDecision` instances.
 */
const IDLE_MOVEMENT: AgentMovementOrder = { type: AgentMovementOrders.Idle };
const HOLD_WEAPON: AgentWeaponOrder = { type: AgentWeaponOrders.Hold };

export function createAgentDecision(): AgentDecision {
  return { movement: IDLE_MOVEMENT, weapon: HOLD_WEAPON };
}

export function resetAgentDecision(decision: AgentDecision): void {
  decision.movement = IDLE_MOVEMENT;
  decision.weapon = HOLD_WEAPON;
}
