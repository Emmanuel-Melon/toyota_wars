import { BTNode, NodeState } from "@toyota/ai";
import type { AgentContext } from "../../agent.types";
import { AgentMovementOrders, AgentWeaponOrders } from "../../agents.config";
import { engagementRanges } from "../../intents/utils";

export class ChaseWithAvoidanceAction extends BTNode<AgentContext> {
  constructor(private standoff?: number) {
    super();
  }

  evaluate(ctx: AgentContext): NodeState {
    if (!ctx.targetPosition) return NodeState.FAILURE;

    const isObjective = ctx.squadOrder.targetIsObjective;
    const stopDistance = isObjective
      ? (ctx.squadOrder.targetStopDistance ?? 0)
      : (this.standoff ?? engagementRanges(ctx).standoff);

    ctx.decision.movement = {
      type: AgentMovementOrders.MoveTo,
      point: ctx.targetPosition,
      speed: ctx.config.chaseSpeed,
      stopDistance,
    };
    ctx.decision.weapon = isObjective
      ? { type: AgentWeaponOrders.Hold }
      : {
          type: AgentWeaponOrders.FireAt,
          point: ctx.targetPosition,
          requireAlignment: false,
        };
    return NodeState.RUNNING;
  }
}
