// apps/toyota-wars/lib/missions/data/hold-the-line/success.ts
import type { MissionInput } from "../../definition/mission.types";

export const objectives: MissionInput["objectives"] = [
  {
    id: "survive",
    title: "Survive for 6 minutes",
    type: "survive",
    params: { seconds: 360 },
  },
  {
    id: "allies-alive",
    title: "Keep both allies alive",
    type: "keepAlive",
    required: false,
    params: { squadId: "guard", minAlive: 2 },
  },
  {
    id: "kill-seven",
    title: "Destroy 7 enemy tanks",
    type: "destroyCount",
    required: false,
    params: { team: "enemy", count: 7 },
  },
];
