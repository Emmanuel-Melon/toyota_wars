// apps/toyota-wars/lib/missions/data/first-contact/failure.ts
import type { MissionInput } from "../../definition/mission.types";

export const failConditions: MissionInput["failConditions"] = [
  { type: "playerDestroyed" },
];
