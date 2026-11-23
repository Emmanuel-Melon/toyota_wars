import { assignArtilleryRear, assignGroup } from "./common";
import type { DirectiveAssignments, DirectiveStrategy } from "./types";

/** Fall back in line formation, everyone covers. */
export const fightingRetreatDirective: DirectiveStrategy = {
  assign(ctx) {
    const out: DirectiveAssignments = new Map();
    assignArtilleryRear(ctx, out);
    assignGroup(
      out,
      ctx.directCombatants,
      () => "support",
      "line",
      ctx.spacing,
    );
    return out;
  },
};
