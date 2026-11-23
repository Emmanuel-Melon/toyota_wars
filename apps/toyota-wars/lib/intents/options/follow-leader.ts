import { createFollowLeaderIntent } from "@toyota/agents";
import { AGENT_CONFIG } from "@/lib/agents/agent-runtime.config";

export const followLeaderIntent = createFollowLeaderIntent(AGENT_CONFIG);
