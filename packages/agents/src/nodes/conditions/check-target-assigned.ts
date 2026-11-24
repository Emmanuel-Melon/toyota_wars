import { BTNode, NodeState } from "@toyota/ai";
import type { AgentContext } from "../../agent.types";

export class CheckTargetAssigned extends BTNode<AgentContext> {
  evaluate(ctx: AgentContext): NodeState {
    return ctx.hasAssignedTarget ? NodeState.SUCCESS : NodeState.FAILURE;
  }
}
