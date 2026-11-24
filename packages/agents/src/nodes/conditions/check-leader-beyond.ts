import { BTNode, NodeState } from "@toyota/ai";
import type { AgentContext } from "../../agent.types";
import { distanceXZ } from "../../contracts/geometry";

export class CheckLeaderBeyond extends BTNode<AgentContext> {
  constructor(private distance: number) {
    super();
  }

  evaluate(ctx: AgentContext): NodeState {
    if (!ctx.leader) return NodeState.FAILURE;
    const dist = distanceXZ(ctx.position, ctx.leader.position);
    return dist > this.distance ? NodeState.SUCCESS : NodeState.FAILURE;
  }
}
