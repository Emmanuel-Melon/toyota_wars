import { AgentNodes } from "../nodes/node-ids";
import type { AgentTreeDef } from "../nodes/tree-def";

export const ROUT_TREE: AgentTreeDef = {
  type: "sequence",
  children: [{ type: AgentNodes.CheckRouted }, { type: AgentNodes.Flee }],
};
