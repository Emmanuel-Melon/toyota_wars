import { BTNode, NodeState } from "@toyota/ai";
import type { AgentContext } from "../../contracts/agent";
import {
  AgentMovementOrders,
  AgentWeaponOrders,
} from "../../contracts/decision";
import { engagementRanges } from "../../intents/utils";

export class LoSRepositionAction extends BTNode<AgentContext> {
  constructor(
    private clearance?: number,
    private sampleCount?: number,
  ) {
    super();
  }

  evaluate(ctx: AgentContext): NodeState {
    if (ctx.lineOfSightClear || !ctx.targetPosition || !ctx.lastKnownPosition) {
      return NodeState.FAILURE;
    }

    const optimalRange = Math.min(
      ctx.weapon.preferredRange,
      engagementRanges(ctx).fire,
    );
    const waypoint = ctx.ports.findFiringRepositionPoint({
      origin: ctx.weaponOrigin,
      target: ctx.lastKnownPosition,
      blockingObstacle: ctx.blockingObstacle,
      obstacles: ctx.obstacles,
      optimalRange,
      bodyRadius: ctx.config.bodyRadius,
      clearance: this.clearance ?? ctx.config.repositionClearance,
      bound: ctx.bound,
      sampleCount: this.sampleCount ?? ctx.config.repositionSampleCount,
      heading: ctx.heading,
    });

    if (!waypoint) {
      ctx.decision.movement = {
        type: AgentMovementOrders.Face,
        point: ctx.lastKnownPosition,
      };
      ctx.decision.weapon = { type: AgentWeaponOrders.Hold };
      return NodeState.RUNNING;
    }

    ctx.decision.movement = {
      type: AgentMovementOrders.MoveTo,
      point: waypoint,
      speed: ctx.config.chaseSpeed,
      stopDistance: ctx.config.repositionStopDistance,
      slowRadius: ctx.config.followSlowRadius,
    };
    ctx.decision.weapon = { type: AgentWeaponOrders.Hold };
    return NodeState.RUNNING;
  }
}
