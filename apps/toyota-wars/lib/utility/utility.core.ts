import { createAgentUtilityDebug } from "@toyota/agents";
import { TANK_CONFIG } from "@/lib/tanks/tanks.config";

export function createUtilityDebug(label: string) {
  if (!TANK_CONFIG.utility.debug) return undefined;

  return createAgentUtilityDebug(label, {
    now: () => performance.now(),
    table: (rows) => console.table(rows),
    debug: (message) => console.debug(message),
  });
}
