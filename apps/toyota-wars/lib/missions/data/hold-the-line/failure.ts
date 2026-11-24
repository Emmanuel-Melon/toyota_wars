// apps/toyota-wars/lib/missions/data/hold-the-line/failure.ts
import type { MissionInput } from "@toyota/missions";

export const failConditions: MissionInput["failConditions"] = [
  { type: "playerDestroyed" },
];
