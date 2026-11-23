// lib/tanks/nodes/actions/aim-at-target.ts
import type { TankContext } from "../../tanks.types";
import { BTNode } from "../../../behavior-tree/behavior-tree.core";
import { NodeState } from "../../../behavior-tree/behavior-tree.config";

/** Aim at the target but don't move or fire. */
export class AimAtTarget extends BTNode<TankContext> {
  evaluate(ctx: TankContext): NodeState {
    if (!ctx.targetPosition) return NodeState.FAILURE;

    ctx.decision.movement = {
      type: "face",
      point: ctx.targetPosition,
    };
    ctx.decision.weapon = { type: "hold" };
    return NodeState.RUNNING;
  }
}
