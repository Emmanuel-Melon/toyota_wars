import { loadMissionData } from "../mission-data";
import type { GameMissionBundle } from "../../missions.registry";

export const cutTheHead = loadMissionData("cut-the-head");

export const cutTheHeadBundle: GameMissionBundle = {
  mission: cutTheHead,
};
