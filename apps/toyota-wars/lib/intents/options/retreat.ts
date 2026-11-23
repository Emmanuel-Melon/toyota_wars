// lib/tanks/intents/retreat/index.ts
import { curves, remap } from "@/lib/selector/math";
import { TANK_INTENT } from "@/lib/utility/utility.types";
import { TankNodes as N } from "@/lib/tanks/tanks.config";
import type { TankContext, TreeDef } from "@/lib/tanks/tanks.types";
import { SQUAD_DIRECTIVE } from "@/lib/squad/squad.types";
import { FIRETEAM_TACTIC } from "@/lib/meso/meso.types";
import { defineIntent, type TankOptionFor } from "../intent.types";
import { gatedOn, whenNotTactic } from "../intent.utils";

/** Contagion never drops below this, so a lone wounded tank can still retreat. */
const CONTAGION_FLOOR = 0.4;
const GENERAL_RETREAT_BONUS = 1.6;

const retreatOption: TankOptionFor<typeof TANK_INTENT.RETREAT> = {
  id: TANK_INTENT.RETREAT,
  weight: (ctx) => {
    // Fragile platforms (e.g. Type 63) panic sooner
    const cautionFactor = 1 - ctx.vehicle.frontlineDurability;
    let base = 0.4 + 0.6 * cautionFactor;
    if (ctx.squadOrder.directive === SQUAD_DIRECTIVE.GENERAL_RETREAT) {
      base *= GENERAL_RETREAT_BONUS;
    }
    return base;
  },
  considerations: [
    gatedOn<TankContext>(
      "retreatAllowed",
      (ctx) =>
        ctx.squadOrder.retreatAllowed &&
        (ctx.squadOrder.directive === SQUAD_DIRECTIVE.GENERAL_RETREAT ||
          ctx.squadOrder.directive === SQUAD_DIRECTIVE.FIGHTING_RETREAT ||
          ctx.retreatActive),
    ),
    whenNotTactic(FIRETEAM_TACTIC.COUNTER_AMBUSH),
    {
      name: "healthPanicCurve",
      input: (ctx) => 1 - ctx.health,
      curve: curves.logistic(0.4, 12),
    },
    {
      // Floored: considerations multiply, so a raw 0 would veto retreat for
      // any tank with no retreating neighbors, however low its health.
      name: "neighborPanicContagion",
      input: (ctx) =>
        CONTAGION_FLOOR +
        (1 - CONTAGION_FLOOR) * remap(ctx.retreatingNeighborsCount, 0, 3),
      curve: curves.linear(),
    },
  ],
};

// Keep moving toward open space away from every enemy.
const retreatTree: TreeDef = {
  type: "selector",
  children: [{ type: N.Flee }, { type: N.Idle }],
};

export const retreatIntent = defineIntent({
  id: TANK_INTENT.RETREAT,
  options: [retreatOption],
  tree: retreatTree,
});
