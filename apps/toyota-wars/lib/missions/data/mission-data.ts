import { MissionBaseSchema, type MissionInput } from "@toyota/missions";

import cutTheHeadData from "@/data/missions/cut-the-head.json";
import firstContactData from "@/data/missions/first-contact.json";
import holdTheLineData from "@/data/missions/hold-the-line.json";
import secureTheCrossroadsData from "@/data/missions/secure-the-crossroads.json";
import stopTheConvoyData from "@/data/missions/stop-the-convoy.json";
import tutorialData from "@/data/missions/tutorial.json";
import vipEscortData from "@/data/missions/vip-escort.json";

const missionData = {
  tutorial: tutorialData,
  "first-contact": firstContactData,
  "hold-the-line": holdTheLineData,
  "cut-the-head": cutTheHeadData,
  "secure-the-crossroads": secureTheCrossroadsData,
  "vip-escort": vipEscortData,
  "stop-the-convoy": stopTheConvoyData,
} as const;

export type MissionDataId = keyof typeof missionData;

export function loadMissionData(id: MissionDataId): MissionInput {
  return MissionBaseSchema.parse(missionData[id]);
}
