import { BTNode, NodeState } from "@toyota/ai";
import type { AgentContext } from "../../contracts/agent";
import {
  AgentMovementOrders,
  AgentWeaponOrders,
} from "../../contracts/decision";

export class FleeAction extends BTNode<AgentContext> {
  evaluate(ctx: AgentContext): NodeState {
    if (ctx.threats.length === 0) return NodeState.FAILURE;

    ctx.decision.movement = {
      type: AgentMovementOrders.Flee,
      threats: ctx.threats,
      speed: ctx.config.fleeSpeed,
    };
    ctx.decision.weapon = ctx.targetPosition
      ? {
          type: AgentWeaponOrders.FireAt,
          point: ctx.targetPosition,
          requireAlignment: false,
        }
      : { type: AgentWeaponOrders.Hold };
    return NodeState.RUNNING;
  }
}
