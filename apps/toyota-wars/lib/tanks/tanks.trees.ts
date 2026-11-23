import {
  buildUtilityAgentTree,
  type AgentUtilityDebugSink,
} from "@toyota/agents";
import { AGENT_CONFIG } from "@/lib/agents/agent-runtime.config";
import { TANK_CONFIG } from "./tanks.config";

const debugSink: AgentUtilityDebugSink | undefined = TANK_CONFIG.utility.debug
  ? {
      now: () => performance.now(),
      table: (rows) => console.table(rows),
      debug: (message) => console.debug(message),
    }
  : undefined;

export function buildUtilityTankTree(unitId: string) {
  return buildUtilityAgentTree(AGENT_CONFIG, debugSink, unitId);
}
