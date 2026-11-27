import { loadMissionData } from "../mission-data";
import type { GameMissionBundle } from "../../missions.registry";

export const stopTheConvoy = loadMissionData("stop-the-convoy");

export const stopTheConvoyBundle: GameMissionBundle = {
  mission: stopTheConvoy,
};
