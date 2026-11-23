import { createPatrolIntent } from "@toyota/agents";
import { AGENT_CONFIG } from "@/lib/agents/agent-runtime.config";

export const patrolIntent = createPatrolIntent(AGENT_CONFIG);
