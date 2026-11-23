import type { MissionInput } from "../../definition/mission.types";

export const objectives: MissionInput["objectives"] = [
  {
    id: "destroy-convoy",
    title: "Destroy the convoy",
    type: "destroySquad",
    params: { squadId: "convoy" },
  },
  {
    id: "convoy-must-not-arrive",
    title: "Do not let the convoy reach the base",
    type: "denyArrival",
    params: { squadId: "convoy" },
  },
];
