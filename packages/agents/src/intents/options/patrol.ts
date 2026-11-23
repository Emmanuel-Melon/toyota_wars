import { curves } from "@toyota/ai";
import type { AgentConfig } from "../../contracts/config";
import { AgentNodes } from "../../nodes/node-ids";
import type { AgentTreeDef } from "../../nodes/tree-def";
import { defineAgentIntent, AgentIntent, type AgentOptionFor } from "../types";
import { isAdvancingWithTarget } from "../utils";

const BASELINE_SCORE = 0.1;

export function createPatrolIntent(_config: AgentConfig) {
  const patrolOption: AgentOptionFor<typeof AgentIntent.Patrol> = {
    id: AgentIntent.Patrol,
    considerations: [
      {
        name: "notAdvancing",
        input: (ctx) => (isAdvancingWithTarget(ctx) ? 0 : 1),
        curve: curves.step(1),
      },
      {
        name: "baseline",
        input: () => 1,
        curve: curves.constant(BASELINE_SCORE),
      },
    ],
  };

  const patrolTree: AgentTreeDef = { type: AgentNodes.Patrol };

  return defineAgentIntent({
    id: AgentIntent.Patrol,
    options: [patrolOption],
    tree: patrolTree,
  });
}
