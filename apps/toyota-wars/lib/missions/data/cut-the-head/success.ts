import type { MissionInput } from "@toyota/missions";

export const objectives: MissionInput["objectives"] = [
  {
    id: "kill-leader",
    title: "Destroy the enemy commander",
    type: "destroySquad",
    params: { squadId: "warband", leaderOnly: true },
  },
  {
    id: "support-alive",
    title: "Keep at least one ally alive",
    type: "keepAlive",
    required: false,
    params: { squadId: "support", minAlive: 1 },
  },
  {
    id: "kill-warband",
    title: "Destroy the entire warband",
    type: "destroySquad",
    required: false,
    params: { squadId: "warband", leaderOnly: false },
  },
];
