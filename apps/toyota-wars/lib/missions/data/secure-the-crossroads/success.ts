// apps/toyota-wars/lib/missions/data/secure-the-crossroads/success.ts
import type { MissionInput } from "@toyota/missions";

export const objectives: MissionInput["objectives"] = [
  {
    id: "take-crossroads",
    title: "Get the squad to the crossroads",
    type: "capture",
    params: { squadId: "guard", zoneId: "crossroads", stopDistance: 18 },
  },
  {
    id: "hold-crossroads",
    title: "Hold the crossroads for 90 seconds",
    type: "defend",
    params: {
      squadId: "guard",
      zoneId: "crossroads-hold",
      seconds: 90,
      stopDistance: 24,
    },
  },
];
