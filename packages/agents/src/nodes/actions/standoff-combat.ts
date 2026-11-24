import { BTNode, NodeState } from "@toyota/ai";
import type { AgentContext } from "../../agent.types";
import { AgentMovementOrders, AgentWeaponOrders } from "../../agents.config";
import { distanceXZ } from "../../contracts/geometry";
import { engagementRanges } from "../../intents/utils";
import { AgentThreat } from "../../agent.types";

export class StandoffCombatAction extends BTNode<AgentContext> {
  constructor(
    private fightingDistance?: number,
    private retreatDistance?: number,
    private approachSpeed?: number,
  ) {
    super();
  }

  evaluate(ctx: AgentContext): NodeState {
    if (!ctx.targetPosition) return NodeState.FAILURE;

    const {
      fire: fireRange,
      standoff,
      retreat: retreatRange,
    } = engagementRanges(ctx);
    const fightingDistance = this.fightingDistance ?? standoff;
    const retreatDistance = this.retreatDistance ?? retreatRange;
    const approachSpeed = this.approachSpeed ?? ctx.config.chaseSpeed;
    const isObjective = ctx.squadOrder.targetIsObjective;
    const distance = distanceXZ(ctx.position, ctx.targetPosition);
    const fireOrder = isObjective
      ? ({ type: AgentWeaponOrders.Hold } as const)
      : ({
          type: AgentWeaponOrders.FireAt,
          point: ctx.targetPosition,
          requireAlignment: false,
        } as const);

    if (distance > fightingDistance) {
      ctx.decision.movement = {
        type: AgentMovementOrders.MoveTo,
        point: ctx.targetPosition,
        speed: approachSpeed,
        stopDistance: fightingDistance,
      };
      ctx.decision.weapon =
        !isObjective && distance <= fireRange
          ? fireOrder
          : ({ type: AgentWeaponOrders.Hold } as const);
      return NodeState.RUNNING;
    }

    if (distance >= retreatDistance) {
      ctx.decision.movement = {
        type: AgentMovementOrders.Face,
        point: ctx.targetPosition,
      };
      ctx.decision.weapon = fireOrder;
      return NodeState.RUNNING;
    }

    if (isObjective) {
      ctx.decision.movement = {
        type: AgentMovementOrders.Face,
        point: ctx.targetPosition,
      };
      ctx.decision.weapon = fireOrder;
      return NodeState.RUNNING;
    }

    if (!ctx.squadOrder.retreatAllowed) {
      ctx.decision.movement = {
        type: AgentMovementOrders.Face,
        point: ctx.targetPosition,
      };
      ctx.decision.weapon = fireOrder;
      return NodeState.RUNNING;
    }

    const threats: readonly AgentThreat[] =
      ctx.threats.length > 0 ? ctx.threats : [{ position: ctx.targetPosition }];
    ctx.decision.movement = {
      type: AgentMovementOrders.Flee,
      threats,
      speed: ctx.config.fleeSpeed,
    };
    ctx.decision.weapon = fireOrder;
    return NodeState.RUNNING;
  }
}
