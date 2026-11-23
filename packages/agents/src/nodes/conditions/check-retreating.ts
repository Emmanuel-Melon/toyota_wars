import { BTNode, NodeState } from "@toyota/ai";
import type { AgentContext } from "../../contracts/agent";

export class CheckRetreating extends BTNode<AgentContext> {
  evaluate(ctx: AgentContext): NodeState {
    return ctx.retreatActive ? NodeState.SUCCESS : NodeState.FAILURE;
  }
}
