// toyota-wars/lib/tanks/trees/rout.ts
import { TankNodes as N } from "../tanks.config";
import type { TreeDef } from "../tanks.types";

// Squad has lost too many units: every tank routs.
export const ROUT_TREE: TreeDef = {
  type: "sequence",
  children: [{ type: N.CheckRouted }, { type: N.Flee }],
};
