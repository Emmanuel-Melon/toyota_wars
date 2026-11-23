import type { TankContext } from "../../tanks.types";
import { hasAssignedTarget } from "../../../combat/combat.targets";
import { BTNode } from "../../../behavior-tree/behavior-tree.core";
import { NodeState } from "../../../behavior-tree/behavior-tree.config";

export class CheckTargetAssigned extends BTNode<TankContext> {
  evaluate(ctx: TankContext): NodeState {
    return hasAssignedTarget(ctx.targetPosition)
      ? NodeState.SUCCESS
      : NodeState.FAILURE;
  }
}
