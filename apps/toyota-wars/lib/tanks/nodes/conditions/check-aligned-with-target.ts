// lib/tanks/nodes/conditions/check-aligned-with-target.ts
import type { TankContext } from "../../tanks.types";
import { TANK_CONFIG } from "../../tanks.config";
import { aimHeading, alignmentError } from "../../../aim/aim.math";
import { BTNode } from "../../../behavior-tree/behavior-tree.core";
import { NodeState } from "../../../behavior-tree/behavior-tree.config";

export class CheckAlignedWithTarget extends BTNode<TankContext> {
  constructor(
    private maxOffset: number = TANK_CONFIG.combat.defaultMaxAngleOffsetRad,
  ) {
    super();
  }

  evaluate(ctx: TankContext): NodeState {
    if (!ctx.targetPosition) return NodeState.FAILURE;
    const err = Math.abs(
      alignmentError(ctx.heading, aimHeading(ctx.position, ctx.targetPosition)),
    );
    return err <= this.maxOffset ? NodeState.SUCCESS : NodeState.FAILURE;
  }
}
