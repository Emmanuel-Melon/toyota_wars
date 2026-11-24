import type { MissionInput } from "@toyota/missions";

export const objectives: MissionInput["objectives"] = [
  {
    id: "training-complete",
    title: "Destroy the training targets",
    type: "destroyCount",
    params: { team: "enemy", count: 2 },
  },
];
