// apps/toyota-wars/lib/missions/data/hold-the-line/mission.ts
import type { FlowScript } from "@/lib/mission-flow/mission-flow.types";
import { loadMissionData } from "../mission-data";
import type { GameMissionBundle } from "../../missions.registry";
import { flankCutscene } from "./cutscenes";
import { evadeQte } from "./qtes";

export const HOLD_THE_LINE_MISSION_ID = "hold-the-line";
export const ARTILLERY_SQUAD_ID = "opening-artillery";
export const HOLD_THE_LINE_FLOW_ID = "hold-the-line-opening";

export const holdTheLine = loadMissionData("hold-the-line");

export const flow: FlowScript = {
  id: HOLD_THE_LINE_FLOW_ID,
  steps: [flankCutscene, evadeQte],
};

export const holdTheLineBundle: GameMissionBundle = {
  mission: holdTheLine,
  flow,
};
