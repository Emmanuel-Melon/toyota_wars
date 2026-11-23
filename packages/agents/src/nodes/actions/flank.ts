import { BTNode, NodeState } from "@toyota/ai";
import type { AgentContext } from "../../contracts/agent";
import {
  AgentMovementOrders,
  AgentWeaponOrders,
} from "../../contracts/decision";
import { distanceXZ, type Vec3 } from "../../contracts/geometry";
import { engagementRanges } from "../../intents/utils";

export class FlankAction extends BTNode<AgentContext> {
  private readonly point: Vec3 = { x: 0, y: 0, z: 0 };

  constructor(
    private orbitRadius?: number,
    private orbitSpeed = 0.8,
    private fireRange?: number,
  ) {
    super();
  }

  evaluate(ctx: AgentContext): NodeState {
    if (!ctx.targetPosition) return NodeState.FAILURE;

    const orbitRadius = this.orbitRadius ?? ctx.config.fightingDistance;
    const tactical = ctx.squadOrder.tactical;
    const flankPoint = tactical?.flankPoint;
    const flankVector = tactical?.flankVector;
    if (flankPoint) {
      this.point.x = flankPoint.x;
      this.point.y = ctx.targetPosition.y;
      this.point.z = flankPoint.y;
    } else if (flankVector) {
      this.point.x = ctx.targetPosition.x + flankVector.x * orbitRadius;
      this.point.y = ctx.targetPosition.y;
      this.point.z = ctx.targetPosition.z + flankVector.y * orbitRadius;
    } else {
      const angle =
        Math.atan2(
          ctx.position.x - ctx.targetPosition.x,
          ctx.position.z - ctx.targetPosition.z,
        ) +
        this.orbitSpeed * ctx.delta;
      this.point.x = ctx.targetPosition.x + Math.sin(angle) * orbitRadius;
      this.point.y = ctx.targetPosition.y;
      this.point.z = ctx.targetPosition.z + Math.cos(angle) * orbitRadius;
    }

    const distance = distanceXZ(ctx.position, ctx.targetPosition);
    const fireRange = Math.min(
      this.fireRange ?? ctx.config.fireRange,
      engagementRanges(ctx).fire,
    );
    const hasClearShot = ctx.lineOfSightClear && distance <= fireRange;

    ctx.decision.movement = hasClearShot
      ? { type: AgentMovementOrders.Face, point: ctx.targetPosition }
      : {
          type: AgentMovementOrders.MoveTo,
          point: this.point,
          speed: ctx.config.chaseSpeed,
          stopDistance: ctx.config.stopDistance,
        };
    ctx.decision.weapon = hasClearShot
      ? {
          type: AgentWeaponOrders.FireAt,
          point: ctx.targetPosition,
          requireAlignment: false,
        }
      : { type: AgentWeaponOrders.Hold };

    return NodeState.RUNNING;
  }
}
