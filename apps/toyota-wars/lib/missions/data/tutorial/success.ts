import type { MissionInput } from "../../definition/mission.types";

export const objectives: MissionInput["objectives"] = [
  {
    id: "training-complete",
    title: "Destroy the training targets",
    type: "destroyCount",
    params: { team: "enemy", count: 2 },
  },
];
