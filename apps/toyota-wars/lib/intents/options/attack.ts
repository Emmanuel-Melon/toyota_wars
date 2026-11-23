// apps/toyota-wars/lib/intents/options/attack.ts
import { curves, remap } from "@/lib/selector/math";
import { TANK_INTENT } from "@/lib/utility/utility.types";
import { TankNodes as N } from "@/lib/tanks/tanks.config";
import type { TankContext, TreeDef } from "@/lib/tanks/tanks.types";
import { SQUAD_DIRECTIVE } from "@/lib/squad/squad.types";
import { defineIntent, type TankOptionFor } from "../intent.types";
import {
  engagementRanges,
  gatedOn,
  hasTarget,
  isAdvancingWithTarget,
  whenNotRole,
} from "../intent.utils";

const NO_FIRE_PENALTY = 0.85;
const ADVANCE_BONUS = 1.8;
const RANGE_FLOOR = 0.65;

const attackOption: TankOptionFor<typeof TANK_INTENT.ATTACK> = {
  id: TANK_INTENT.ATTACK,
  weight: (ctx) =>
    (0.5 + 0.5 * ctx.weapon.directSuppression) *
    (ctx.canFire ? 1 : NO_FIRE_PENALTY) *
    (isAdvancingWithTarget(ctx) ? ADVANCE_BONUS : 1),
  considerations: [
    hasTarget,
    whenNotRole("pin", "flank", "flankOrReposition"),
    gatedOn<TankContext>(
      "notRetreating",
      (ctx) =>
        ctx.squadOrder.directive !== SQUAD_DIRECTIVE.GENERAL_RETREAT &&
        !ctx.retreatActive,
    ),
    {
      name: "engagementRange",
      input: (ctx) => {
        if (ctx.squadOrder.targetIsObjective) return 1;
        const { fire } = engagementRanges(ctx);
        if (!Number.isFinite(ctx.targetDistance)) return 0;
        const close = 1 - remap(ctx.targetDistance, fire, fire * 1.5);
        return RANGE_FLOOR + (1 - RANGE_FLOOR) * close;
      },
      curve: curves.linear(),
    },
    {
      name: "durableOrSupported",
      input: (ctx) => ctx.health * ctx.vehicle.frontlineDurability,
      curve: curves.logistic(0.3, 10),
    },
  ],
};

const attackTree: TreeDef = {
  type: "sequence",
  children: [
    { type: N.CheckTargetAssigned },
    {
      type: "selector",
      children: [
        {
          type: "sequence",
          children: [
            { type: N.CheckTargetInRange },
            { type: N.StandoffCombat },
          ],
        },
        { type: N.Chase },
      ],
    },
  ],
};

export const attackIntent = defineIntent({
  id: TANK_INTENT.ATTACK,
  options: [attackOption],
  tree: attackTree,
});
