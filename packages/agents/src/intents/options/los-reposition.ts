import { curves } from "@toyota/ai";
import { AgentConfig } from "../../agent.types";
import { AgentNodes } from "../../nodes/node-ids";
import type { AgentTreeDef } from "../../nodes/tree-def";
import { defineAgentIntent, AgentIntent, type AgentOptionFor } from "../types";
import { hasTarget } from "../utils";

const LOS_REPOSITION_WEIGHT = 2.5;

export function createLosRepositionIntent(config: AgentConfig) {
  const losRepositionOption: AgentOptionFor<typeof AgentIntent.LoSReposition> =
    {
      id: AgentIntent.LoSReposition,
      weight: () => LOS_REPOSITION_WEIGHT,
      considerations: [
        hasTarget,
        {
          name: "lineOfSightBlocked",
          input: (ctx) => (ctx.lineOfSightClear ? 0 : 1),
          curve: curves.step(1),
        },
        {
          name: "hasLastKnownPosition",
          input: (ctx) => (ctx.lastKnownPosition ? 1 : 0),
          curve: curves.step(1),
        },
      ],
    };

  const losRepositionTree: AgentTreeDef = {
    type: "sequence",
    children: [
      { type: AgentNodes.CheckTargetAssigned },
      {
        type: AgentNodes.LoSReposition,
        params: {
          clearance: config.repositionClearance,
          sampleCount: config.repositionSampleCount,
        },
      },
    ],
  };

  return defineAgentIntent({
    id: AgentIntent.LoSReposition,
    options: [losRepositionOption],
    tree: losRepositionTree,
  });
}
