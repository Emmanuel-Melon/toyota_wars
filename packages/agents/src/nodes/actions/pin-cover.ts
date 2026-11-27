import { BTNode, NodeState } from "@toyota/ai";
import type { AgentContext } from "../../agent.types";
import { AgentMovementOrders, AgentWeaponOrders } from "../../agents.config";
import { distanceXZ, type Vec3 } from "../../contracts/geometry";
import { engagementRanges } from "../../intents/utils";

export class PinCoverAction extends BTNode<AgentContext> {
  private readonly point: Vec3 = { x: 0, y: 0, z: 0 };

  evaluate(ctx: AgentContext): NodeState {
    if (!ctx.targetPosition) return NodeState.FAILURE;

    const tactical = ctx.squadOrder.tactical;
    const pinPoint = tactical?.pinPoint;
    if (pinPoint) {
      this.point.x = pinPoint.x;
      this.point.y = ctx.targetPosition.y;
      this.point.z = pinPoint.y;
      const distance = distanceXZ(ctx.position, this.point);
      if (distance > ctx.config.repositionStopDistance) {
        ctx.decision.movement = {
          type: AgentMovementOrders.MoveTo,
          point: this.point,
          speed: ctx.config.chaseSpeed,
          stopDistance: ctx.config.repositionStopDistance,
          slowRadius: ctx.config.followSlowRadius,
        };
      } else {
        ctx.decision.movement = {
          type: AgentMovementOrders.Face,
          point: ctx.targetPosition,
        };
      }
    } else {
      ctx.decision.movement = {
        type: AgentMovementOrders.Face,
        point: ctx.targetPosition,
      };
    }

    const distance = distanceXZ(ctx.position, ctx.targetPosition);
    const inRange =
      distance <= Math.max(engagementRanges(ctx).fire, ctx.config.fireRange);
    ctx.decision.weapon =
      ctx.lineOfSightClear && inRange
        ? {
            type: AgentWeaponOrders.FireAt,
            point: ctx.targetPosition,
            requireAlignment: false,
          }
        : { type: AgentWeaponOrders.Hold };

    return NodeState.RUNNING;
  }
}
