// lib/tanks/nodes/conditions/check-leader-beyond.ts
import * as THREE from "three";
import type { TankContext } from "../../tanks.types";
import { BTNode } from "../../../behavior-tree/behavior-tree.core";
import { NodeState } from "../../../behavior-tree/behavior-tree.config";
import { distanceXZ } from "../../../movement/movement.math";

export class CheckLeaderBeyond extends BTNode<TankContext> {
  constructor(private distance: number) {
    super();
  }

  evaluate(ctx: TankContext): NodeState {
    if (!ctx.leader) return NodeState.FAILURE;
    const dist = distanceXZ(ctx.position, ctx.leader.position);
    return dist > this.distance ? NodeState.SUCCESS : NodeState.FAILURE;
  }
}
