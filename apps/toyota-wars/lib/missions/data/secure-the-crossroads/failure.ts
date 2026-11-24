import type { MissionInput } from "@toyota/missions";

export const failConditions: MissionInput["failConditions"] = [
  { type: "playerDestroyed" },
];
