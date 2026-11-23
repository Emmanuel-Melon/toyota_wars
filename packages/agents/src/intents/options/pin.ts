import { curves, remap } from "@toyota/ai";
import type { AgentConfig } from "../../contracts/config";
import { AgentSquadDirective } from "../../contracts/domain";
import { AgentNodes } from "../../nodes/node-ids";
import type { AgentTreeDef } from "../../nodes/tree-def";
import { defineAgentIntent, AgentIntent, type AgentOptionFor } from "../types";
import {
  engagementRanges,
  gatedOn,
  hasTarget,
  whenLineOfSightClear,
  whenRole,
} from "../utils";

const PIN_WEIGHT = 2;

export function createPinIntent(_config: AgentConfig) {
  const pinOption: AgentOptionFor<typeof AgentIntent.Pin> = {
    id: AgentIntent.Pin,
    weight: () => PIN_WEIGHT,
    considerations: [
      hasTarget,
      whenRole("pin"),
      whenLineOfSightClear,
      gatedOn(
        "notRetreating",
        (ctx) =>
          ctx.squadOrder.directive !== AgentSquadDirective.GeneralRetreat &&
          !ctx.retreatActive,
      ),
      {
        name: "fireRange",
        input: (ctx) => {
          const { fire } = engagementRanges(ctx);
          return 0.4 + 0.6 * (1 - remap(ctx.targetDistance, fire, fire * 1.5));
        },
        curve: curves.linear(),
      },
    ],
  };

  const pinTree: AgentTreeDef = {
    type: "sequence",
    children: [
      { type: AgentNodes.CheckTargetAssigned },
      { type: AgentNodes.PinCover },
    ],
  };

  return defineAgentIntent({
    id: AgentIntent.Pin,
    options: [pinOption],
    tree: pinTree,
  });
}
