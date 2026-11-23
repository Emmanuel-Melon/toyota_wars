import { curves, remap } from "@toyota/ai";
import type { AgentConfig } from "../../contracts/config";
import {
  AgentFireteamTactic,
  AgentSquadDirective,
} from "../../contracts/domain";
import { AgentNodes } from "../../nodes/node-ids";
import type { AgentTreeDef } from "../../nodes/tree-def";
import { defineAgentIntent, AgentIntent, type AgentOptionFor } from "../types";
import { gatedOn, whenNotTactic } from "../utils";

const CONTAGION_FLOOR = 0.4;
const GENERAL_RETREAT_BONUS = 1.6;

export function createRetreatIntent(_config: AgentConfig) {
  const retreatOption: AgentOptionFor<typeof AgentIntent.Retreat> = {
    id: AgentIntent.Retreat,
    weight: (ctx) => {
      const cautionFactor = 1 - ctx.vehicle.frontlineDurability;
      let base = 0.4 + 0.6 * cautionFactor;
      if (ctx.squadOrder.directive === AgentSquadDirective.GeneralRetreat) {
        base *= GENERAL_RETREAT_BONUS;
      }
      return base;
    },
    considerations: [
      gatedOn(
        "retreatAllowed",
        (ctx) =>
          ctx.squadOrder.retreatAllowed &&
          (ctx.squadOrder.directive === AgentSquadDirective.GeneralRetreat ||
            ctx.squadOrder.directive === AgentSquadDirective.FightingRetreat ||
            ctx.retreatActive),
      ),
      whenNotTactic(AgentFireteamTactic.CounterAmbush),
      {
        name: "healthPanicCurve",
        input: (ctx) => 1 - ctx.health,
        curve: curves.logistic(0.4, 12),
      },
      {
        name: "neighborPanicContagion",
        input: (ctx) =>
          CONTAGION_FLOOR +
          (1 - CONTAGION_FLOOR) * remap(ctx.retreatingNeighborsCount, 0, 3),
        curve: curves.linear(),
      },
    ],
  };

  const retreatTree: AgentTreeDef = {
    type: "selector",
    children: [{ type: AgentNodes.Flee }, { type: AgentNodes.Idle }],
  };

  return defineAgentIntent({
    id: AgentIntent.Retreat,
    options: [retreatOption],
    tree: retreatTree,
  });
}
