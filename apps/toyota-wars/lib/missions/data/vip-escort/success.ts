import type { MissionInput } from "../../definition/mission.types";

export const objectives: MissionInput["objectives"] = [
  {
    id: "vip-arrives",
    title: "Get the VIP to extraction",
    type: "arrive",
    params: { squadId: "vip", escortSquadIds: ["escort"] },
  },
  {
    id: "keep-vip-alive",
    title: "Keep the VIP alive",
    type: "keepAlive",
    params: { squadId: "vip", minAlive: 1 },
  },
];
