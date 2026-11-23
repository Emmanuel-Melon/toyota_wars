import { assignArtilleryRear, assignGroup } from "./common";
import type { DirectiveAssignments, DirectiveStrategy } from "./types";

/**
 * High-mobility DShKs hook around the enemy line; ZU-23s + rockets suppress
 * from the front. Preserves original behavior exactly (see "bugs" below —
 * all skirmishers end up flanking because the original code sorted in place).
 */
export const flankDirective: DirectiveStrategy = {
  assign(ctx) {
    const out: DirectiveAssignments = new Map();
    assignArtilleryRear(ctx, out);

    const flankers = [...ctx.skirmishers].sort(
      (a, b) => b.vehicle.mobility - a.vehicle.mobility,
    );
    const flankerIds = new Set(flankers.map((f) => f.id));
    const suppressors = [
      ...ctx.heavyDirect,
      ...ctx.artillery,
      ...ctx.skirmishers.filter((s) => !flankerIds.has(s.id)),
    ];

    assignGroup(out, flankers, () => "flank", "column", ctx.spacing, true);
    assignGroup(out, suppressors, () => "suppress", "line", ctx.spacing);
    return out;
  },
};
