import { BTNode, NodeState } from "@toyota/ai";
import type { AgentContext } from "../../agent.types";
import { distanceXZ } from "../../contracts/geometry";
import { engagementRanges } from "../../intents/utils";

export class CheckTargetInRange extends BTNode<AgentContext> {
  constructor(private range?: number) {
    super();
  }

  evaluate(ctx: AgentContext): NodeState {
    const target = ctx.targetPosition ?? ctx.lastKnownPosition;
    if (!target) return NodeState.FAILURE;
    const range =
      this.range ??
      (ctx.squadOrder.targetIsObjective
        ? (ctx.squadOrder.targetStopDistance ?? 0)
        : Math.max(engagementRanges(ctx).fire, ctx.config.fireRange));
    const distance = distanceXZ(ctx.position, target);
    return distance <= range ? NodeState.SUCCESS : NodeState.FAILURE;
  }
}
