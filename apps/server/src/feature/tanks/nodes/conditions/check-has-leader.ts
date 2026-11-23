import type { TankContext } from "../../tanks.types";
import { BTNode } from "../../../behavior-tree/behavior-tree.core";
import { NodeState } from "../../../behavior-tree/behavior-tree.config";

export class CheckHasLeader extends BTNode<TankContext> {
  evaluate(ctx: TankContext): NodeState {
    return ctx.leader ? NodeState.SUCCESS : NodeState.FAILURE;
  }
}
