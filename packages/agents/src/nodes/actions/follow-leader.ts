import { BTNode, NodeState } from "@toyota/ai";
import type { AgentContext } from "../../contracts/agent";
import { AgentWeaponOrders } from "../../contracts/decision";

export class FollowLeader extends BTNode<AgentContext> {
  constructor(
    private arriveRadius?: number,
    private slowRadius?: number,
  ) {
    super();
  }

  evaluate(ctx: AgentContext): NodeState {
    if (!ctx.leader) return NodeState.FAILURE;

    ctx.decision.movement = ctx.ports.resolveFormationMovement(
      ctx,
      this.arriveRadius ?? ctx.config.followArriveRadius,
      this.slowRadius ?? ctx.config.followSlowRadius,
    );
    ctx.decision.weapon = { type: AgentWeaponOrders.Hold };
    return NodeState.RUNNING;
  }
}
