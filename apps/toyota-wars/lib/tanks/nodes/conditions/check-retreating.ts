// lib/tanks/nodes/conditions/check-retreating.ts
import type { TankContext } from "../../tanks.types";
import { BTNode } from "../../../behavior-tree/behavior-tree.core";
import { NodeState } from "../../../behavior-tree/behavior-tree.config";

export class CheckRetreating extends BTNode<TankContext> {
  evaluate(ctx: TankContext): NodeState {
    return ctx.retreatActive ? NodeState.SUCCESS : NodeState.FAILURE;
  }
}
