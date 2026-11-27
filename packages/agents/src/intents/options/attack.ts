import { curves, remap } from "@toyota/ai";
import type { AgentContext } from "../../agent.types";
import { AgentNodes } from "../../nodes/node-ids";
import type { AgentTreeDef } from "../../nodes/tree-def";
import { defineAgentIntent, AgentIntent, type AgentOptionFor } from "../types";
import {
  engagementRanges,
  gatedOn,
  hasTarget,
  isAdvancingWithTarget,
  whenNotRole,
} from "../utils";
import { AgentConfig } from "../../agent.types";
import { AgentSquadDirective } from "../../agents.config";

const NO_FIRE_PENALTY = 0.85;
const ADVANCE_BONUS = 1.8;
const RANGE_FLOOR = 0.65;

export function createAttackIntent(_config: AgentConfig) {
  const attackOption: AgentOptionFor<typeof AgentIntent.Attack> = {
    id: AgentIntent.Attack,
    weight: (ctx: AgentContext) =>
      (0.5 + 0.5 * ctx.weapon.directSuppression) *
      (ctx.canFire ? 1 : NO_FIRE_PENALTY) *
      (isAdvancingWithTarget(ctx) ? ADVANCE_BONUS : 1),
    considerations: [
      hasTarget,
      whenNotRole("pin", "flank", "flankOrReposition"),
      gatedOn<AgentContext>(
        "notRetreating",
        (ctx) =>
          ctx.squadOrder.directive !== AgentSquadDirective.GeneralRetreat &&
          !ctx.retreatActive,
      ),
      {
        name: "engagementRange",
        input: (ctx) => {
          if (ctx.squadOrder.targetIsObjective) return 1;
          const { fire } = engagementRanges(ctx);
          if (!Number.isFinite(ctx.targetDistance)) return 0;
          const close = 1 - remap(ctx.targetDistance, fire, fire * 1.25);
          return RANGE_FLOOR + (1 - RANGE_FLOOR) * close;
        },
        curve: curves.linear(),
      },
      {
        name: "durableOrSupported",
        input: (ctx) => ctx.health * ctx.vehicle.frontlineDurability,
        curve: curves.logistic(0.3, 10),
      },
    ],
  };

  const attackTree: AgentTreeDef = {
    type: "sequence",
    children: [
      { type: AgentNodes.CheckTargetAssigned },
      {
        type: "selector",
        children: [
          {
            type: "sequence",
            children: [
              { type: AgentNodes.CheckTargetInRange },
              { type: AgentNodes.StandoffCombat },
            ],
          },
          { type: AgentNodes.Chase },
        ],
      },
    ],
  };

  return defineAgentIntent({
    id: AgentIntent.Attack,
    options: [attackOption],
    tree: attackTree,
  });
}
