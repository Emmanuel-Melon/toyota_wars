import type { MissionInput } from "../../definition/mission.types";
import { noEffects } from "../../definition/mission.presets";
import { failConditions } from "./failure";
import { objectives } from "./success";
import { ROAD_WAYPOINTS, zones } from "./zones";

export const secureTheCrossroads: MissionInput = {
  id: "secure-the-crossroads",
  schemaVersion: 2,
  order: 4,
  title: "Secure the Crossroads",
  briefing:
    "Move the allied squad up the road, take the crossroads, then hold it while you cover their flank.",
  difficulty: 2,
  requires: ["hold-the-line"],
  zones,
  arena: {
    seed: 4004,
    size: 600,
    obstacleDensity: 0.3,
    playerSpawn: { x: 0, z: 240 },
    roads: {
      waypoints: ROAD_WAYPOINTS,
      width: 24,
    },
  },
  squads: [
    {
      id: "guard",
      team: "ally",
      units: [{ template: "medium" }, { template: "medium" }],
      spawnPoints: [
        { x: -36, z: 255 },
        { x: 36, z: 255 },
      ],
      personality: { aggression: 0.6, caution: 0.5 },
      initialOrder: "follow",
    },
    {
      id: "crossroads-guards",
      team: "enemy",
      units: [
        { template: "light" },
        { template: "light" },
        { template: "light" },
      ],
      spawnPoints: [
        { x: -75, z: -150 },
        { x: 0, z: -180 },
        { x: 75, z: -150 },
      ],
      personality: { aggression: 0.5, caution: 0.5 },
      initialOrder: "patrol",
      ...noEffects(),
    },
  ],
  objectives,
  failConditions,
  rewards: { xp: 250, unlocks: [] },
};
