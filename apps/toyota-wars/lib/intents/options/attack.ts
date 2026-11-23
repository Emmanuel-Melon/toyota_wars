import { createAttackIntent } from "@toyota/agents";
import { AGENT_CONFIG } from "@/lib/agents/agent-runtime.config";

export const attackIntent = createAttackIntent(AGENT_CONFIG);
