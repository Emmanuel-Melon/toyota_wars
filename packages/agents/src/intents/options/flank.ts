import { curves, remap } from "@toyota/ai";
import { AgentConfig } from "../../agent.types";
import { AgentSquadDirective } from "../../agents.config";
import { AgentNodes } from "../../nodes/node-ids";
import type { AgentTreeDef } from "../../nodes/tree-def";
import { defineAgentIntent, AgentIntent, type AgentOptionFor } from "../types";
import { gatedOn, hasTarget, whenRole } from "../utils";

const ORDERED_FLANK_WEIGHT = 1.5;
const ORBIT_SPEED = 0.4;

export function createFlankIntent(config: AgentConfig) {
  const fireRange = Math.max(config.fireRange, config.fightingDistance * 1.1);
  const orbitRadius = Math.min(config.fightingDistance, fireRange * 0.85);

  const flankOption: AgentOptionFor<typeof AgentIntent.Flank> = {
    id: AgentIntent.Flank,
    weight: () => ORDERED_FLANK_WEIGHT,
    considerations: [
      hasTarget,
      whenRole("flank", "flankOrReposition"),
      gatedOn(
        "canFlank",
        (ctx) =>
          ctx.squadOrder.tactical != null ||
          ctx.squadOrder.directive === AgentSquadDirective.Flank,
      ),
      {
        name: "outOfRange",
        input: (ctx) =>
          0.35 + 0.65 * remap(ctx.targetDistance, fireRange, fireRange * 1.75),
        curve: curves.linear(),
      },
      {
        name: "haveBacking",
        input: (ctx) => 0.35 + 0.65 * remap(ctx.alliesNearby, 0, 3),
        curve: curves.linear(),
      },
    ],
  };

  const flankTree: AgentTreeDef = {
    type: "sequence",
    children: [
      { type: AgentNodes.CheckTargetAssigned },
      {
        type: AgentNodes.Flank,
        params: {
          orbitRadius,
          orbitSpeed: ORBIT_SPEED,
          fireRange,
        },
      },
    ],
  };

  return defineAgentIntent({
    id: AgentIntent.Flank,
    options: [flankOption],
    tree: flankTree,
  });
}
