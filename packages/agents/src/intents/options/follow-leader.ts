import { curves } from "@toyota/ai";
import { AgentConfig } from "../../agent.types";
import { AgentSquadDirective } from "../../agents.config";
import { AgentNodes } from "../../nodes/node-ids";
import type { AgentTreeDef } from "../../nodes/tree-def";
import { defineAgentIntent, AgentIntent, type AgentOptionFor } from "../types";
import {
  distanceToRallyPoint,
  isAdvancingWithTarget,
  strayedRatio,
  whenNotRole,
} from "../utils";

type Option = AgentOptionFor<typeof AgentIntent.FollowLeader>;

const IN_LEASH_FLOOR = 0.2;

export function createFollowLeaderIntent(_config: AgentConfig) {
  const leaderDistanceOption: Option = {
    id: AgentIntent.FollowLeader,
    weight: (ctx) => (isAdvancingWithTarget(ctx) ? 0.35 : 1),
    considerations: [
      whenNotRole("pin", "flank", "flankOrReposition"),
      {
        name: "hasLeader",
        input: (ctx) => (Number.isFinite(ctx.leaderDistance) ? 1 : 0),
        curve: curves.step(1),
      },
      {
        name: "strayed",
        input: (ctx) =>
          IN_LEASH_FLOOR +
          (1 - IN_LEASH_FLOOR) * strayedRatio(ctx.leaderDistance, ctx),
        curve: curves.linear(),
      },
    ],
  };

  const squadDirectiveOption: Option = {
    id: AgentIntent.FollowLeader,
    weight: (ctx) =>
      isAdvancingWithTarget(ctx)
        ? 0.35
        : ctx.squadOrder.directive === AgentSquadDirective.Hold
          ? 1.2
          : 0.8,
    considerations: [
      whenNotRole("pin", "flank", "flankOrReposition"),
      {
        name: "hasSquadDirective",
        input: (ctx) => (ctx.squadOrder.rallyPoint ? 1 : 0),
        curve: curves.step(1),
      },
      {
        name: "strayedFromRallyPoint",
        input: (ctx) => strayedRatio(distanceToRallyPoint(ctx), ctx),
        curve: curves.linear(),
      },
    ],
  };

  const followLeaderTree: AgentTreeDef = {
    type: "selector",
    children: [
      {
        type: "sequence",
        children: [
          { type: AgentNodes.CheckTargetAssigned },
          { type: AgentNodes.CheckTargetInRange },
          { type: AgentNodes.FormationFire },
        ],
      },
      { type: AgentNodes.FollowLeader },
    ],
  };

  return defineAgentIntent({
    id: AgentIntent.FollowLeader,
    options: [leaderDistanceOption, squadDirectiveOption],
    tree: followLeaderTree,
  });
}
