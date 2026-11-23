import type { UtilityOption } from "@toyota/ai";
import type { AgentContext } from "../contracts/agent";
import type { AgentTreeDef } from "../nodes/tree-def";

export const AgentIntent = {
  Attack: "attack",
  Pin: "pin",
  Retreat: "retreat",
  Flank: "flank",
  LoSReposition: "losReposition",
  FollowLeader: "followLeader",
  Patrol: "patrol",
} as const;

export type AgentIntentId = (typeof AgentIntent)[keyof typeof AgentIntent];

export type AgentOptionFor<Id extends AgentIntentId> = UtilityOption<
  AgentContext,
  Id
>;

export type AgentUtilityOption = UtilityOption<AgentContext, AgentIntentId>;

export interface AgentIntentDef<Id extends AgentIntentId = AgentIntentId> {
  id: Id;
  options: AgentOptionFor<Id>[];
  tree: AgentTreeDef;
}

export function defineAgentIntent<Id extends AgentIntentId>(
  def: AgentIntentDef<Id>,
): AgentIntentDef<Id> {
  return def;
}
