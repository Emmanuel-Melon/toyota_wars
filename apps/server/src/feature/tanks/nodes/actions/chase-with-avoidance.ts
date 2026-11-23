// lib/tanks/nodes/actions/chase-with-avoidance.ts
import type { TankContext } from "../../tanks.types";
import { MOVEMENT_CONFIG } from "../../../movement/movement.config";
import { BTNode } from "../../../behavior-tree/behavior-tree.core";
import { NodeState } from "../../../behavior-tree/behavior-tree.config";

/** Request movement toward the target, stopping at standoff range. */
export class ChaseWithAvoidanceAction extends BTNode<TankContext> {
  constructor(
    private standoff: number = MOVEMENT_CONFIG.chase.standoffDistance,
  ) {
    super();
  }

  evaluate(ctx: TankContext): NodeState {
    if (!ctx.targetPosition) return NodeState.FAILURE;

    ctx.decision.movement = {
      type: "moveTo",
      point: ctx.targetPosition,
      speed: MOVEMENT_CONFIG.throttle.chase,
      stopDistance: this.standoff,
    };
    ctx.decision.weapon = { type: "hold" };
    return NodeState.RUNNING;
  }
}
