// apps/toyota-wars/lib/missions/data/first-contact/mission.ts
import type { MissionInput } from "@toyota/missions";
import { noEffects } from "@toyota/missions";
import type { FlowScript } from "@/lib/mission-flow/mission-flow.types";
import type { GameMissionBundle } from "../../missions.registry";
import { failConditions } from "./failure";
import { objectives } from "./success";
import { FIRST_CONTACT_FLOW_ID } from "./ids";
import { hostileContactCutscene, patrolOpening } from "./cutscenes";
import { acknowledgeContactQte } from "./qtes";

export const firstContact: MissionInput = {
  id: "first-contact",
  schemaVersion: 2,
  order: 1,
  title: "First Contact",
  briefing:
    "A small scout patrol has crossed into the plains. Two allied tanks are joining you, so use the rocks for cover and take the scouts down together.",
  difficulty: 1,
  requires: [],
  arena: {
    seed: 1001,
    size: 600,
    obstacleDensity: 0.35,
    playerSpawn: { x: 0, z: 240 },
  },
  squads: [
    {
      id: "support",
      team: "ally",
      units: [{ template: "medium" }, { template: "medium" }],
      spawnPoints: [
        { x: -36, z: 258 },
        { x: 36, z: 258 },
      ],
      personality: { aggression: 0.5, caution: 0.6 },
      initialOrder: "follow",
      ...noEffects(),
    },
    {
      id: "intel",
      team: "ally",
      units: [{ template: "radar" }],
      spawnPoints: [{ x: 0, z: 290 }],
      personality: { aggression: 0.2, caution: 0.9 },
      initialOrder: "follow",
      ...noEffects(),
    },
    {
      id: "scouts",
      team: "enemy",
      units: [
        { template: "light" },
        { template: "light" },
        { template: "light" },
      ],
      spawnPoints: [
        { x: -120, z: -180 },
        { x: 0, z: -210 },
        { x: 120, z: -180 },
      ],
      personality: { aggression: 0.3, caution: 0.6 },
      initialOrder: "patrol",
      ...noEffects(),
    },
  ],
  objectives,
  failConditions,
  rewards: { xp: 100, unlocks: ["hold-the-line"] },
};

export const flow: FlowScript = {
  id: FIRST_CONTACT_FLOW_ID,
  steps: [patrolOpening, hostileContactCutscene, acknowledgeContactQte],
};

export const firstContactBundle: GameMissionBundle = {
  mission: firstContact,
  flow,
};
