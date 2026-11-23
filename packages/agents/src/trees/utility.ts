import { BTNode, BTSelector, UtilitySelector } from "@toyota/ai";
import type { AgentContext } from "../contracts/agent";
import type { AgentConfig } from "../contracts/config";
import {
  createAgentUtilityDebug,
  type AgentUtilityDebugSink,
} from "../intents/debug";
import { createAgentIntentRegistry } from "../intents/registry";
import type { AgentIntentId } from "../intents/types";
import { buildAgentTree } from "../nodes/builder";
import { ROUT_TREE } from "./rout";

export function buildUtilityAgentTree(
  config: AgentConfig,
  debugSink?: AgentUtilityDebugSink,
  label = "agent",
): BTNode<AgentContext> {
  const { allIntents, agentOptions } = createAgentIntentRegistry(config);
  const children = {} as Record<AgentIntentId, BTNode<AgentContext>>;

  for (const intent of allIntents) {
    children[intent.id] = buildAgentTree(intent.tree);
  }

  const utility = new UtilitySelector<AgentContext, AgentIntentId>(
    agentOptions,
    children,
    {
      momentumBonus: config.momentumBonus,
      minCommitMs: config.minCommitMs,
      forcedIntent: (ctx) => ctx.squadOrder.forcedIntent,
      debug: createAgentUtilityDebug(label, debugSink),
    },
  );

  return new BTSelector<AgentContext>([buildAgentTree(ROUT_TREE), utility]);
}
