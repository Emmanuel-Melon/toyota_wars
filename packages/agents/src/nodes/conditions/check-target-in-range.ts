import { BTNode, NodeState } from "@toyota/ai";
import type { AgentContext } from "../../contracts/agent";
import { distanceXZ } from "../../contracts/geometry";
import { engagementRanges } from "../../intents/utils";

export class CheckTargetInRange extends BTNode<AgentContext> {
  constructor(private range?: number) {
    super();
  }

  evaluate(ctx: AgentContext): NodeState {
    if (!ctx.targetPosition) return NodeState.FAILURE;
    const range =
      this.range ??
      (ctx.squadOrder.targetIsObjective
        ? (ctx.squadOrder.targetStopDistance ?? 0)
        : engagementRanges(ctx).fire);
    const distance = distanceXZ(ctx.position, ctx.targetPosition);
    return distance <= range ? NodeState.SUCCESS : NodeState.FAILURE;
  }
}
