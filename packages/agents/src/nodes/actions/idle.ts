import { BTNode, NodeState } from "@toyota/ai";
import type { AgentContext } from "../../contracts/agent";
import {
  AgentMovementOrders,
  AgentWeaponOrders,
} from "../../contracts/decision";

export class IdleAction extends BTNode<AgentContext> {
  evaluate(ctx: AgentContext): NodeState {
    ctx.decision.movement = { type: AgentMovementOrders.Idle };
    ctx.decision.weapon = { type: AgentWeaponOrders.Hold };
    return NodeState.RUNNING;
  }
}
