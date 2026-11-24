import { MissionCatalogSchema } from "@toyota/missions";

import { applyMissionLayout } from "../map/mission-layout";
import {
  cutTheHeadBundle,
  firstContactBundle,
  holdTheLineBundle,
  secureTheCrossroadsBundle,
  stopTheConvoyBundle,
  tutorialBundle,
  vipEscortBundle,
} from "./data";
import { assertMissionTemplates } from "./data/templates";
import { registerMission } from "./missions.registry";

const bundles = [
  tutorialBundle,
  firstContactBundle,
  holdTheLineBundle,
  cutTheHeadBundle,
  secureTheCrossroadsBundle,
  vipEscortBundle,
  stopTheConvoyBundle,
];

const missions = MissionCatalogSchema.parse(
  bundles.map((bundle) => applyMissionLayout(bundle.mission)),
);

assertMissionTemplates(missions);

missions.forEach((mission, index) => {
  const bundle = bundles[index];
  registerMission({
    mission,
    flow: bundle.flow,
    tutorial: bundle.tutorial,
  });
});
