import { createAgentIntentRegistry } from "@toyota/agents";
import { AGENT_CONFIG } from "@/lib/agents/agent-runtime.config";

const registry = createAgentIntentRegistry(AGENT_CONFIG);

export const INTENTS = registry.intents;
export const ALL_INTENTS = registry.allIntents;
export const tankOptions = registry.agentOptions;
