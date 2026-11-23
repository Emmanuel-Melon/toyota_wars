import { assignArtilleryRear, assignGroup } from "./common";
import type { DirectiveAssignments, DirectiveStrategy } from "./types";

/** ZU-23s form the heavy vanguard; DShKs take outer wings. */
export const advanceDirective: DirectiveStrategy = {
  assign(ctx) {
    const out: DirectiveAssignments = new Map();
    assignArtilleryRear(ctx, out);
    assignGroup(
      out,
      ctx.directCombatants,
      (i) => (i < ctx.heavyDirect.length ? "vanguard" : "suppress"),
      "wedge",
      ctx.spacing,
    );
    return out;
  },
};
