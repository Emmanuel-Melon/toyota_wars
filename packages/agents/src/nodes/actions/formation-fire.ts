import { BTNode, NodeState } from "@toyota/ai";
import type { AgentContext } from "../../agent.types";
import { AgentMovementOrders, AgentWeaponOrders } from "../../agents.config";

export class FormationFireAction extends BTNode<AgentContext> {
  evaluate(ctx: AgentContext): NodeState {
    if (!ctx.targetPosition) return NodeState.FAILURE;

    if (ctx.leader) {
      ctx.decision.movement = ctx.ports.resolveFormationMovement(ctx);
    } else {
      ctx.decision.movement = {
        type: AgentMovementOrders.Face,
        point: ctx.targetPosition,
      };
    }

    ctx.decision.weapon = {
      type: AgentWeaponOrders.FireAt,
      point: ctx.targetPosition,
      requireAlignment: false,
    };

    return NodeState.RUNNING;
  }
}
