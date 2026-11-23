import { BTNode, NodeState } from "@toyota/ai";
import type { AgentContext } from "../../contracts/agent";
import { alignmentError, headingTo } from "../../contracts/geometry";

export class CheckAlignedWithTarget extends BTNode<AgentContext> {
  constructor(private maxOffset?: number) {
    super();
  }

  evaluate(ctx: AgentContext): NodeState {
    if (!ctx.targetPosition) return NodeState.FAILURE;
    const maxOffset = this.maxOffset ?? ctx.config.defaultMaxAngleOffsetRad;
    const err = Math.abs(
      alignmentError(ctx.heading, headingTo(ctx.position, ctx.targetPosition)),
    );
    return err <= maxOffset ? NodeState.SUCCESS : NodeState.FAILURE;
  }
}
