import { BTNode, NodeState } from "@toyota/ai";
import type { AgentContext } from "../../contracts/agent";

export class CheckHasLeader extends BTNode<AgentContext> {
  evaluate(ctx: AgentContext): NodeState {
    return ctx.leader ? NodeState.SUCCESS : NodeState.FAILURE;
  }
}
