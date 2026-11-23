import type { TankContext } from "../../tanks.types";
import { BTNode } from "../../../behavior-tree/behavior-tree.core";
import { NodeState } from "../../../behavior-tree/behavior-tree.config";

/** Hold position, aim, and request fire when the weapon is ready. */
export class ShootTargetAction extends BTNode<TankContext> {
  evaluate(ctx: TankContext): NodeState {
    if (!ctx.targetPosition) return NodeState.FAILURE;

    ctx.decision.movement = {
      type: "face",
      point: ctx.targetPosition,
    };
    ctx.decision.weapon = {
      type: "fireAt",
      point: ctx.targetPosition,
      requireAlignment: !ctx.canFireWhileMoving,
    };

    return ctx.canFire ? NodeState.SUCCESS : NodeState.RUNNING;
  }
}
