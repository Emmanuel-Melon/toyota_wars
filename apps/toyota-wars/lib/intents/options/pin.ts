import { createPinIntent } from "@toyota/agents";
import { AGENT_CONFIG } from "@/lib/agents/agent-runtime.config";

export const pinIntent = createPinIntent(AGENT_CONFIG);
