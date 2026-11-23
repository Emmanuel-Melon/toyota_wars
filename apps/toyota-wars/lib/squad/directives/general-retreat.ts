import { assignArtilleryRear, assignGroup } from "./common";
import type { DirectiveAssignments, DirectiveStrategy } from "./types";

/** Column withdrawal — maximize speed, minimize exposure. */
export const generalRetreatDirective: DirectiveStrategy = {
  assign(ctx) {
    const out: DirectiveAssignments = new Map();
    assignArtilleryRear(ctx, out);
    assignGroup(
      out,
      ctx.directCombatants,
      () => "support",
      "column",
      ctx.spacing,
    );
    return out;
  },
};
