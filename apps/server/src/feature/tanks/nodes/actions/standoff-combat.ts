import type { TankContext } from "../../tanks.types";
import { MOVEMENT_CONFIG } from "../../../movement/movement.config";
import { MovementOrders } from "../../../movement/movement.types";
import { BTNode } from "../../../behavior-tree/behavior-tree.core";
import { NodeState } from "../../../behavior-tree/behavior-tree.config";

export class StandoffCombatAction extends BTNode<TankContext> {
  constructor(
    private fightingDistance = 55,
    private retreatDistance = 45,
    private approachSpeed: number = MOVEMENT_CONFIG.throttle.chase,
  ) {
    super();
  }

  evaluate(ctx: TankContext): NodeState {
    if (!ctx.targetPosition) return NodeState.FAILURE;

    const distance = ctx.position.distanceTo(ctx.targetPosition);

    if (distance > this.fightingDistance) {
      ctx.decision.movement = {
        type: MovementOrders.MoveTo,
        point: ctx.targetPosition,
        speed: this.approachSpeed,
        stopDistance: this.fightingDistance,
      };
      ctx.decision.weapon =
        distance <= 60
          ? {
              type: "fireAt",
              point: ctx.targetPosition,
              requireAlignment: false,
            }
          : { type: "hold" };
      return NodeState.RUNNING;
    }

    if (distance >= this.retreatDistance) {
      ctx.decision.movement = {
        type: MovementOrders.Face,
        point: ctx.targetPosition,
      };
      ctx.decision.weapon = {
        type: "fireAt",
        point: ctx.targetPosition,
        requireAlignment: false,
      };
      return NodeState.RUNNING;
    }

    const threats =
      ctx.threats.length > 0 ? ctx.threats : [{ position: ctx.targetPosition }];
    ctx.decision.movement = {
      type: MovementOrders.Flee,
      threats,
      speed: MOVEMENT_CONFIG.throttle.flee,
    };
    ctx.decision.weapon = {
      type: "fireAt",
      point: ctx.targetPosition,
      requireAlignment: false,
    };
    return NodeState.RUNNING;
  }
}
