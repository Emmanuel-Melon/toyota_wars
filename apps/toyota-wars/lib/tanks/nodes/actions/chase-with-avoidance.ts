// lib/tanks/nodes/actions/chase-with-avoidance.ts
import type { TankContext } from "../../tanks.types";
import { MOVEMENT_CONFIG } from "../../../movement/movement.config";
import { BTNode } from "../../../behavior-tree/behavior-tree.core";
import { NodeState } from "../../../behavior-tree/behavior-tree.config";
import { engagementRanges } from "../../../intents/intent.utils";

/** Request movement toward the target, stopping at standoff range. */
export class ChaseWithAvoidanceAction extends BTNode<TankContext> {
  constructor(private standoff?: number) {
    super();
  }

  evaluate(ctx: TankContext): NodeState {
    if (!ctx.targetPosition) return NodeState.FAILURE;

    const isObjective = ctx.squadOrder.targetIsObjective;
    const stopDistance = isObjective
      ? (ctx.squadOrder.targetStopDistance ?? 0)
      : (this.standoff ?? engagementRanges(ctx).standoff);

    ctx.decision.movement = {
      type: "moveTo",
      point: ctx.targetPosition,
      speed: MOVEMENT_CONFIG.throttle.chase,
      stopDistance,
    };
    ctx.decision.weapon = isObjective
      ? { type: "hold" }
      : {
          type: "fireAt",
          point: ctx.targetPosition,
          requireAlignment: false,
        };
    return NodeState.RUNNING;
  }
}
