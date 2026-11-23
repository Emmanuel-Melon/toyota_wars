import { createFlankIntent } from "@toyota/agents";
import { AGENT_CONFIG } from "@/lib/agents/agent-runtime.config";

export const flankIntent = createFlankIntent(AGENT_CONFIG);
