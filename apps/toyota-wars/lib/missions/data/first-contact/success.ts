// apps/toyota-wars/lib/missions/data/first-contact/success.ts
import type { MissionInput } from "../../definition/mission.types";

export const objectives: MissionInput["objectives"] = [
  {
    id: "clear-scouts",
    title: "Destroy the scout patrol",
    type: "destroyCount",
    params: { team: "enemy", count: 3 },
  },
  {
    id: "support-alive",
    title: "Keep both allies alive",
    type: "keepAlive",
    required: false,
    params: { squadId: "support", minAlive: 2 },
  },
];
