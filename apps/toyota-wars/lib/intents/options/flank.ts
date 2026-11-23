// lib/tanks/intents/flank/index.ts
import { curves, remap } from "@/lib/selector/math";
import { TANK_INTENT } from "@/lib/utility/utility.types";
import { TankNodes as N } from "@/lib/tanks/tanks.config";
import type { TankContext, TreeDef } from "@/lib/tanks/tanks.types";
import { SQUAD_DIRECTIVE } from "@/lib/squad/squad.types";
import { FIRE_RANGE } from "../intents.constants";
import { defineIntent, type TankOptionFor } from "../intent.types";
import { gatedOn, hasTarget, whenRole } from "../intent.utils";

const ORDERED_FLANK_WEIGHT = 1.5;
const ORBIT_RADIUS = FIRE_RANGE * 0.8;
const ORBIT_SPEED = 0.4;

const flankOption: TankOptionFor<typeof TANK_INTENT.FLANK> = {
  id: TANK_INTENT.FLANK,
  weight: () => ORDERED_FLANK_WEIGHT,
  considerations: [
    hasTarget,
    whenRole("flank", "flankOrReposition"),
    gatedOn<TankContext>(
      "canFlank",
      (ctx) =>
        ctx.squadOrder.tactical != null ||
        ctx.squadOrder.directive === SQUAD_DIRECTIVE.FLANK,
    ),
    {
      name: "outOfRange",
      input: (ctx) =>
        0.35 + 0.65 * remap(ctx.targetDistance, FIRE_RANGE, FIRE_RANGE * 3),
      curve: curves.linear(),
    },
    {
      name: "haveBacking",
      input: (ctx) => 0.35 + 0.65 * remap(ctx.alliesNearby, 0, 3),
      curve: curves.linear(),
    },
  ],
};

const flankTree: TreeDef = {
  type: "sequence",
  children: [
    { type: N.CheckTargetAssigned },
    {
      type: N.Flank,
      params: {
        orbitRadius: ORBIT_RADIUS,
        orbitSpeed: ORBIT_SPEED,
        fireRange: FIRE_RANGE,
      },
    },
  ],
};

export const flankIntent = defineIntent({
  id: TANK_INTENT.FLANK,
  options: [flankOption],
  tree: flankTree,
});
