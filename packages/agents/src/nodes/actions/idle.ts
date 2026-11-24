import { BTNode, NodeState } from "@toyota/ai";
import type { AgentContext } from "../../agent.types";
import { AgentMovementOrders, AgentWeaponOrders } from "../../agents.config";

export class IdleAction extends BTNode<AgentContext> {
  evaluate(ctx: AgentContext): NodeState {
    ctx.decision.movement = { type: AgentMovementOrders.Idle };
    ctx.decision.weapon = { type: AgentWeaponOrders.Hold };
    return NodeState.RUNNING;
  }
}
