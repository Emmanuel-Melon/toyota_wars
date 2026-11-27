import { loadMissionData } from "../mission-data";
import type { GameMissionBundle } from "../../missions.registry";

export const vipEscort = loadMissionData("vip-escort");

export const vipEscortBundle: GameMissionBundle = {
  mission: vipEscort,
};
