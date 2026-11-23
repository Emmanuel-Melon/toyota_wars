import * as THREE from "three";
import type { TankContext } from "../../tanks.types";
import { engagementRanges } from "../../../intents/intent.utils";
import { MOVEMENT_CONFIG } from "../../../movement/movement.config";
import { MovementOrders } from "../../../movement/movement.types";
import { BTNode } from "../../../behavior-tree/behavior-tree.core";
import { NodeState } from "../../../behavior-tree/behavior-tree.config";

export class PinCoverAction extends BTNode<TankContext> {
  private readonly point = new THREE.Vector3();

  evaluate(ctx: TankContext): NodeState {
    if (!ctx.targetPosition) return NodeState.FAILURE;

    const tactical = ctx.squadOrder.tactical;
    const pinPoint = tactical?.pinPoint;
    if (pinPoint) {
      this.point.set(pinPoint.x, ctx.targetPosition.y, pinPoint.y);
      const distance = Math.hypot(
        this.point.x - ctx.position.x,
        this.point.z - ctx.position.z,
      );
      if (distance > MOVEMENT_CONFIG.reposition.stopDistance) {
        ctx.decision.movement = {
          type: MovementOrders.MoveTo,
          point: this.point,
          speed: MOVEMENT_CONFIG.throttle.chase,
          stopDistance: MOVEMENT_CONFIG.reposition.stopDistance,
          slowRadius: MOVEMENT_CONFIG.follow.slowRadius,
        };
      } else {
        ctx.decision.movement = {
          type: MovementOrders.Face,
          point: ctx.targetPosition,
        };
      }
    } else {
      ctx.decision.movement = {
        type: MovementOrders.Face,
        point: ctx.targetPosition,
      };
    }

    const distance = Math.hypot(
      ctx.targetPosition.x - ctx.position.x,
      ctx.targetPosition.z - ctx.position.z,
    );
    const inRange = distance <= engagementRanges(ctx).fire;
    ctx.decision.weapon =
      ctx.lineOfSightClear && inRange
        ? {
            type: "fireAt",
            point: ctx.targetPosition,
            requireAlignment: false,
          }
        : { type: "hold" };

    return NodeState.RUNNING;
  }
}
