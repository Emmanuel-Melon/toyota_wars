import type { TankContext } from "../../tanks.types";
import { MOVEMENT_CONFIG } from "../../../movement/movement.config";
import { MovementOrders } from "../../../movement/movement.types";
import { BTNode } from "../../../behavior-tree/behavior-tree.core";
import { NodeState } from "../../../behavior-tree/behavior-tree.config";
import { engagementRanges } from "../../../intents/intent.utils";

export class StandoffCombatAction extends BTNode<TankContext> {
  constructor(
    private fightingDistance?: number,
    private retreatDistance?: number,
    private approachSpeed?: number,
  ) {
    super();
  }

  evaluate(ctx: TankContext): NodeState {
    if (!ctx.targetPosition) return NodeState.FAILURE;

    const {
      fire: fireRange,
      standoff,
      retreat: retreatRange,
    } = engagementRanges(ctx);
    const fightingDistance = this.fightingDistance ?? standoff;
    const retreatDistance = this.retreatDistance ?? retreatRange;
    const approachSpeed = this.approachSpeed ?? MOVEMENT_CONFIG.throttle.chase;
    const isObjective = ctx.squadOrder.targetIsObjective;
    const distance = Math.hypot(
      ctx.position.x - ctx.targetPosition.x,
      ctx.position.z - ctx.targetPosition.z,
    );
    const fireOrder = isObjective
      ? ({ type: "hold" } as const)
      : ({
          type: "fireAt",
          point: ctx.targetPosition,
          requireAlignment: false,
        } as const);

    if (distance > fightingDistance) {
      ctx.decision.movement = {
        type: MovementOrders.MoveTo,
        point: ctx.targetPosition,
        speed: approachSpeed,
        stopDistance: fightingDistance,
      };
      ctx.decision.weapon =
        !isObjective && distance <= fireRange
          ? fireOrder
          : ({ type: "hold" } as const);
      return NodeState.RUNNING;
    }

    if (distance >= retreatDistance) {
      ctx.decision.movement = {
        type: MovementOrders.Face,
        point: ctx.targetPosition,
      };
      ctx.decision.weapon = fireOrder;
      return NodeState.RUNNING;
    }

    if (isObjective) {
      ctx.decision.movement = {
        type: MovementOrders.Face,
        point: ctx.targetPosition,
      };
      ctx.decision.weapon = fireOrder;
      return NodeState.RUNNING;
    }

    if (!ctx.squadOrder.retreatAllowed) {
      ctx.decision.movement = {
        type: MovementOrders.Face,
        point: ctx.targetPosition,
      };
      ctx.decision.weapon = fireOrder;
      return NodeState.RUNNING;
    }

    const threats =
      ctx.threats.length > 0 ? ctx.threats : [{ position: ctx.targetPosition }];
    ctx.decision.movement = {
      type: MovementOrders.Flee,
      threats,
      speed: MOVEMENT_CONFIG.throttle.flee,
    };
    ctx.decision.weapon = fireOrder;
    return NodeState.RUNNING;
  }
}
