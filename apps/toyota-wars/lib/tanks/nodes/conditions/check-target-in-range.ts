// lib/tanks/nodes/conditions/check-target-in-range.ts
import type { TankContext } from "../../tanks.types";
import { BTNode } from "../../../behavior-tree/behavior-tree.core";
import { NodeState } from "../../../behavior-tree/behavior-tree.config";
import { engagementRanges } from "../../../intents/intent.utils";

export class CheckTargetInRange extends BTNode<TankContext> {
  constructor(private range?: number) {
    super();
  }

  evaluate(ctx: TankContext): NodeState {
    if (!ctx.targetPosition) return NodeState.FAILURE;
    const range =
      this.range ??
      (ctx.squadOrder.targetIsObjective
        ? (ctx.squadOrder.targetStopDistance ?? 0)
        : engagementRanges(ctx).fire);
    const distance = Math.hypot(
      ctx.position.x - ctx.targetPosition.x,
      ctx.position.z - ctx.targetPosition.z,
    );
    return distance <= range ? NodeState.SUCCESS : NodeState.FAILURE;
  }
}
