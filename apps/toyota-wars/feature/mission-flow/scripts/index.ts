import type { FlowScript } from "../mission-flow.types";
import { holdTheLineOpening } from "./hold-the-line";

const MISSION_FLOW_SCRIPTS: Record<string, FlowScript> = {
  "hold-the-line": holdTheLineOpening,
};

export function getMissionFlowScript(missionId: string): FlowScript | null {
  return MISSION_FLOW_SCRIPTS[missionId] ?? null;
}
