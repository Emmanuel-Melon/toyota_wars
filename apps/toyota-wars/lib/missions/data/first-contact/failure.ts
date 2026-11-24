// apps/toyota-wars/lib/missions/data/first-contact/failure.ts
import type { MissionInput } from "@toyota/missions";

export const failConditions: MissionInput["failConditions"] = [
  { type: "playerDestroyed" },
];
