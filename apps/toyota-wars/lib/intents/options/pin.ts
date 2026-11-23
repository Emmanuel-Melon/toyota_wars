import { curves, remap } from "@/lib/selector/math";
import type { TankContext } from "@/lib/tanks/tanks.types";
import { TANK_INTENT } from "@/lib/utility/utility.types";
import { TankNodes as N } from "@/lib/tanks/tanks.config";
import type { TreeDef } from "@/lib/tanks/tanks.types";
import { SQUAD_DIRECTIVE } from "@/lib/squad/squad.types";
import { defineIntent, type TankOptionFor } from "../intent.types";
import {
  engagementRanges,
  gatedOn,
  hasTarget,
  whenLineOfSightClear,
  whenRole,
} from "../intent.utils";

const PIN_WEIGHT = 2;

const pinOption: TankOptionFor<typeof TANK_INTENT.PIN> = {
  id: TANK_INTENT.PIN,
  weight: () => PIN_WEIGHT,
  considerations: [
    hasTarget,
    whenRole("pin"),
    whenLineOfSightClear,
    gatedOn<TankContext>(
      "notRetreating",
      (ctx) =>
        ctx.squadOrder.directive !== SQUAD_DIRECTIVE.GENERAL_RETREAT &&
        !ctx.retreatActive,
    ),
    {
      name: "fireRange",
      input: (ctx) => {
        const { fire } = engagementRanges(ctx);
        return 0.4 + 0.6 * (1 - remap(ctx.targetDistance, fire, fire * 1.5));
      },
      curve: curves.linear(),
    },
  ],
};

const pinTree: TreeDef = {
  type: "sequence",
  children: [{ type: N.CheckTargetAssigned }, { type: N.PinCover }],
};

export const pinIntent = defineIntent({
  id: TANK_INTENT.PIN,
  options: [pinOption],
  tree: pinTree,
});
