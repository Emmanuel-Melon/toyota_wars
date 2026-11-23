// lib/tanks/intents/follow-leader/index.ts
import { curves } from "@/lib/selector/math";
import { TANK_INTENT } from "@/lib/utility/utility.types";
import { TankNodes as N } from "@/lib/tanks/tanks.config";
import type { TreeDef } from "@/lib/tanks/tanks.types";
import { SQUAD_DIRECTIVE } from "@/lib/squad/squad.types";
import { defineIntent, type TankOptionFor } from "../intent.types";
import {
  distanceToRallyPoint,
  isAdvancingWithTarget,
  strayedRatio,
  whenNotRole,
} from "../intent.utils";

type Option = TankOptionFor<typeof TANK_INTENT.FOLLOW_LEADER>;

const IN_LEASH_FLOOR = 0.2;

/** Scoring model 1: stay near the actual leader unit. */
const leaderDistanceOption: Option = {
  id: TANK_INTENT.FOLLOW_LEADER,
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

/** Scoring model 2: stay near the squad rally point (hold/advance orders). */
const squadDirectiveOption: Option = {
  id: TANK_INTENT.FOLLOW_LEADER,
  weight: (ctx) =>
    isAdvancingWithTarget(ctx)
      ? 0.35
      : ctx.squadOrder?.directive === SQUAD_DIRECTIVE.HOLD
        ? 1.2
        : 0.8,
  considerations: [
    whenNotRole("pin", "flank", "flankOrReposition"),
    {
      name: "hasSquadDirective",
      input: (ctx) => (ctx.squadOrder?.rallyPoint ? 1 : 0),
      curve: curves.step(1),
    },
    {
      name: "strayedFromRallyPoint",
      input: (ctx) => strayedRatio(distanceToRallyPoint(ctx), ctx),
      curve: curves.linear(),
    },
  ],
};

const followLeaderTree: TreeDef = {
  type: "selector",
  children: [
    {
      type: "sequence",
      children: [
        { type: N.CheckTargetAssigned },
        { type: N.CheckTargetInRange },
        { type: N.FormationFire },
      ],
    },
    { type: N.FollowLeader },
  ],
};

export const followLeaderIntent = defineIntent({
  id: TANK_INTENT.FOLLOW_LEADER,
  // OR-composed: the higher raw score represents the intent.
  options: [leaderDistanceOption, squadDirectiveOption],
  tree: followLeaderTree,
});
