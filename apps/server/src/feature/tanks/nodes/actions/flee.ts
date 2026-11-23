// lib/tanks/nodes/actions/flee.ts
import type { TankContext } from "../../tanks.types";
import { MOVEMENT_CONFIG } from "../../../movement/movement.config";
import { BTNode } from "../../../behavior-tree/behavior-tree.core";
import { NodeState } from "../../../behavior-tree/behavior-tree.config";

/** Request escape movement away from every threat. */
export class FleeAction extends BTNode<TankContext> {
  evaluate(ctx: TankContext): NodeState {
    if (ctx.threats.length === 0) return NodeState.FAILURE;

    ctx.decision.movement = {
      type: "flee",
      threats: ctx.threats,
      speed: MOVEMENT_CONFIG.throttle.flee,
    };
    ctx.decision.weapon = ctx.targetPosition
      ? {
          type: "fireAt",
          point: ctx.targetPosition,
          requireAlignment: false,
        }
      : { type: "hold" };
    return NodeState.RUNNING;
  }
}
