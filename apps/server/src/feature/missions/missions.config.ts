import { JsonApiResourceConfig } from "@/lib/express/express.types";

import type { Mission } from "./missions.types";

export const MISSION_SORTABLE_FIELDS = [
  "order",
  "title",
  "difficulty",
  "createdAt",
] as const;

export const SerializedMission: JsonApiResourceConfig<Mission> = {
  type: "mission",
  attributes: (mission: Mission) => mission,
};
