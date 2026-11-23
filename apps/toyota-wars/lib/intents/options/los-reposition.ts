import { curves } from "@/lib/selector/math";
import { TANK_INTENT } from "@/lib/utility/utility.types";
import { TankNodes as N } from "@/lib/tanks/tanks.config";
import type { TreeDef } from "@/lib/tanks/tanks.types";
import { defineIntent, type TankOptionFor } from "../intent.types";
import { hasTarget } from "../intent.utils";
import { MOVEMENT_CONFIG } from "@/lib/movement/movement.config";

const LOS_REPOSITION_WEIGHT = 2.5;

const losRepositionOption: TankOptionFor<typeof TANK_INTENT.LOS_REPOSITION> = {
  id: TANK_INTENT.LOS_REPOSITION,
  weight: () => LOS_REPOSITION_WEIGHT,
  considerations: [
    hasTarget,
    {
      name: "lineOfSightBlocked",
      input: (ctx) => (ctx.lineOfSightClear ? 0 : 1),
      curve: curves.step(1),
    },
    {
      name: "hasLastKnownPosition",
      input: (ctx) => (ctx.lastKnownPosition ? 1 : 0),
      curve: curves.step(1),
    },
  ],
};

const losRepositionTree: TreeDef = {
  type: "sequence",
  children: [
    { type: N.CheckTargetAssigned },
    {
      type: N.LoSReposition,
      params: {
        clearance: MOVEMENT_CONFIG.reposition.clearance,
        sampleCount: MOVEMENT_CONFIG.reposition.sampleCount,
      },
    },
  ],
};

export const losRepositionIntent = defineIntent({
  id: TANK_INTENT.LOS_REPOSITION,
  options: [losRepositionOption],
  tree: losRepositionTree,
});
