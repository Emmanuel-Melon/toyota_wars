// apps/toyota-wars/lib/missions/data/secure-the-crossroads/mission.ts
import { loadMissionData } from "../mission-data";
import type { GameMissionBundle } from "../../missions.registry";

export const secureTheCrossroads = loadMissionData("secure-the-crossroads");

export const secureTheCrossroadsBundle: GameMissionBundle = {
  mission: secureTheCrossroads,
};
