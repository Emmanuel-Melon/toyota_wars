import { BTNode, NodeState } from "@toyota/ai";
import type { AgentContext } from "../../contracts/agent";

export class CheckRouted extends BTNode<AgentContext> {
  evaluate(ctx: AgentContext): NodeState {
    return ctx.routed && ctx.squadOrder.retreatAllowed
      ? NodeState.SUCCESS
      : NodeState.FAILURE;
  }
}
