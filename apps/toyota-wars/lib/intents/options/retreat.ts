import { createRetreatIntent } from "@toyota/agents";
import { AGENT_CONFIG } from "@/lib/agents/agent-runtime.config";

export const retreatIntent = createRetreatIntent(AGENT_CONFIG);
