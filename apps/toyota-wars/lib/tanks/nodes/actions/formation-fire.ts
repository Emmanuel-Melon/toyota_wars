import type { TankContext } from "../../tanks.types";
import { MovementOrders } from "../../../movement/movement.types";
import { BTNode } from "../../../behavior-tree/behavior-tree.core";
import { NodeState } from "../../../behavior-tree/behavior-tree.config";
import { resolveFormationMovement } from "../../tanks.formation";

export class FormationFireAction extends BTNode<TankContext> {
  evaluate(ctx: TankContext): NodeState {
    if (!ctx.targetPosition) return NodeState.FAILURE;

    if (ctx.leader) {
      ctx.decision.movement = resolveFormationMovement(ctx);
    } else {
      ctx.decision.movement = {
        type: MovementOrders.Face,
        point: ctx.targetPosition,
      };
    }

    ctx.decision.weapon = {
      type: "fireAt",
      point: ctx.targetPosition,
      requireAlignment: false,
    };

    return NodeState.RUNNING;
  }
}
