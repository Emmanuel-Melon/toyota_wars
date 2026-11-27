// apps/toyota-wars/lib/missions/data/first-contact/mission.ts
import type { FlowScript } from "@/lib/mission-flow/mission-flow.types";
import { loadMissionData } from "../mission-data";
import type { GameMissionBundle } from "../../missions.registry";
import { FIRST_CONTACT_FLOW_ID } from "./ids";
import { hostileContactCutscene, patrolOpening } from "./cutscenes";
import { acknowledgeContactQte } from "./qtes";

export const firstContact = loadMissionData("first-contact");

export const flow: FlowScript = {
  id: FIRST_CONTACT_FLOW_ID,
  steps: [patrolOpening, hostileContactCutscene, acknowledgeContactQte],
};

export const firstContactBundle: GameMissionBundle = {
  mission: firstContact,
  flow,
};
