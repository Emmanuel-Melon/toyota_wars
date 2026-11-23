// apps/toyota-wars/lib/missions/missions.data.ts
import { applyMissionLayout } from "../map/mission-layout";
import { MissionCatalogSchema } from "./definition/mission.schema";
import type { Mission } from "./definition/mission.types";
import { assertMissionTemplates } from "./missions.templates";
import {
  cutTheHead,
  firstContact,
  holdTheLine,
  secureTheCrossroads,
  stopTheConvoy,
  tutorial,
  vipEscort,
} from "./data";

/**
 * Arena size is 600, so positions run roughly -300..300 on x and z.
 * Mission layouts are generated deterministically at catalog build time;
 * authored positions provide zones, routes, spawn counts, and map tuning.
 */

export const TUTORIAL_MISSION_ID = tutorial.id;

const raw = [
  tutorial,
  firstContact,
  holdTheLine,
  cutTheHead,
  secureTheCrossroads,
  vipEscort,
  stopTheConvoy,
];

/** Validates structure and cross-references (squad ids, mission ids) at load time. */
export const MISSIONS: Mission[] = MissionCatalogSchema.parse(
  raw.map(applyMissionLayout),
);

assertMissionTemplates(MISSIONS);
