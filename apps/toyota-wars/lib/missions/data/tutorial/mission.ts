import { loadMissionData } from "../mission-data";
import type { GameMissionBundle } from "../../missions.registry";

export const tutorial = loadMissionData("tutorial");

export const tutorialBundle: GameMissionBundle = {
  mission: tutorial,
  tutorial: true,
};
