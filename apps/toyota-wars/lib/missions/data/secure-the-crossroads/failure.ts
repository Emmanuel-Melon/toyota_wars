// apps/toyota-wars/lib/missions/data/secure-the-crossroads/failure.ts
import type { MissionInput } from "@toyota/missions";

export const failConditions: MissionInput["failConditions"] = [
  { type: "playerDestroyed" },
];
