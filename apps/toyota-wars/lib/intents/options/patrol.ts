// lib/tanks/intents/patrol/index.ts

import { curves } from "@/lib/selector/math";
import { TankNodes } from "@/lib/tanks/tanks.config";
import type { TreeDef } from "@/lib/tanks/tanks.types";
import { TANK_INTENT } from "@/lib/utility/utility.types";
import { defineIntent, TankOptionFor } from "../intent.types";
import { isAdvancingWithTarget } from "../intent.utils";

/** Always slightly viable; wins only when nothing else scores above it. */
const BASELINE_SCORE = 0.1;

const patrolOption: TankOptionFor<typeof TANK_INTENT.PATROL> = {
  id: TANK_INTENT.PATROL,
  considerations: [
    {
      name: "notAdvancing",
      input: (ctx) => (isAdvancingWithTarget(ctx) ? 0 : 1),
      curve: curves.step(1),
    },
    {
      name: "baseline",
      input: () => 1,
      curve: curves.constant(BASELINE_SCORE),
    },
  ],
};

const patrolTree: TreeDef = { type: TankNodes.Patrol };

export const patrolIntent = defineIntent({
  id: TANK_INTENT.PATROL,
  options: [patrolOption],
  tree: patrolTree,
});
