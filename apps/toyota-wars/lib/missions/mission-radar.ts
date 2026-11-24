import { TEAM } from "./definition/mission.constants";
import { rosterUnitId } from "../squad/squad.roster";

export const RADAR_SQUAD_ID = "intel";
export const RADAR_UNIT_ID = rosterUnitId(TEAM.ALLY, RADAR_SQUAD_ID, 0);
