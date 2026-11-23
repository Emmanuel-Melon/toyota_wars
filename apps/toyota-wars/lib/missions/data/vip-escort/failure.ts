import type { MissionInput } from "../../definition/mission.types";

export const failConditions: MissionInput["failConditions"] = [
  { type: "playerDestroyed" },
];
