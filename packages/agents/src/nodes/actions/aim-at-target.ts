import { BTNode, NodeState } from "@toyota/ai";
import type { AgentContext } from "../../agent.types";
import { AgentMovementOrders, AgentWeaponOrders } from "../../agents.config";

export class AimAtTarget extends BTNode<AgentContext> {
  evaluate(ctx: AgentContext): NodeState {
    if (!ctx.targetPosition) return NodeState.FAILURE;

    ctx.decision.movement = {
      type: AgentMovementOrders.Face,
      point: ctx.targetPosition,
    };
    ctx.decision.weapon = { type: AgentWeaponOrders.Hold };
    return NodeState.RUNNING;
  }
}
