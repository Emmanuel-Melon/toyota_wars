import { assignArtilleryRear, assignGroup } from "./common";
import type { DirectiveAssignments, DirectiveStrategy } from "./types";

/** Static line — heavies suppress, skirmishers screen. */
export const holdDirective: DirectiveStrategy = {
  assign(ctx) {
    const out: DirectiveAssignments = new Map();
    assignArtilleryRear(ctx, out);
    assignGroup(
      out,
      ctx.directCombatants,
      (i) => (i < ctx.heavyDirect.length ? "suppress" : "vanguard"),
      "line",
      ctx.spacing,
    );
    return out;
  },
};
