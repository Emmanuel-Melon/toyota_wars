import { createLosRepositionIntent } from "@toyota/agents";
import { AGENT_CONFIG } from "@/lib/agents/agent-runtime.config";

export const losRepositionIntent = createLosRepositionIntent(AGENT_CONFIG);
