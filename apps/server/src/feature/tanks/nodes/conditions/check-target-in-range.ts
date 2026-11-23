// lib/tanks/nodes/conditions/check-target-in-range.ts
import * as THREE from "three";
import type { TankContext } from "../../tanks.types";
import { BTNode } from "../../../behavior-tree/behavior-tree.core";
import { NodeState } from "../../../behavior-tree/behavior-tree.config";

export class CheckTargetInRange extends BTNode<TankContext> {
  constructor(private range: number) {
    super();
  }

  evaluate(ctx: TankContext): NodeState {
    if (!ctx.targetPosition) return NodeState.FAILURE;
    return ctx.position.distanceTo(ctx.targetPosition) <= this.range
      ? NodeState.SUCCESS
      : NodeState.FAILURE;
  }
}
