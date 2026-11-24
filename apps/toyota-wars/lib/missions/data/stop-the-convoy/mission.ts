import type { MissionInput } from "../../definition/mission.types";
import { noEffects } from "../../definition/mission.presets";
import { failConditions } from "./failure";
import { objectives } from "./success";
import { CONVOY_ROUTE, ROAD_WAYPOINTS } from "./zones";

export const stopTheConvoy: MissionInput = {
  id: "stop-the-convoy",
  schemaVersion: 2,
  order: 7,
  title: "Stop the Convoy",
  briefing:
    "An enemy convoy is pushing toward the southern base. Destroy it before the lead vehicles reach the approach road.",
  difficulty: 4,
  requires: [],
  arena: {
    seed: 7007,
    size: 600,
    obstacleDensity: 0.32,
    playerSpawn: { x: 0, z: 240 },
    roads: {
      waypoints: ROAD_WAYPOINTS,
      width: 28,
    },
  },
  squads: [
    {
      id: "convoy",
      team: "enemy",
      units: [
        { template: "medium", isLeader: true },
        { template: "medium" },
        { template: "medium" },
        { template: "light" },
      ],
      spawnPoints: [
        { x: 0, z: -252 },
        { x: -24, z: -264 },
        { x: 24, z: -264 },
        { x: 0, z: -276 },
      ],
      personality: { aggression: 0.55, caution: 0.5 },
      initialOrder: "patrol",
      route: CONVOY_ROUTE,
      routeRadius: 30,
      ...noEffects(),
    },
    {
      id: "convoy-screen",
      team: "enemy",
      units: [{ template: "light" }, { template: "light" }],
      spawnPoints: [
        { x: -60, z: -204 },
        { x: 60, z: -204 },
      ],
      personality: { aggression: 0.6, caution: 0.4 },
      initialOrder: "patrol",
      ...noEffects(),
    },
    {
      id: "interceptors",
      team: "ally",
      units: [{ template: "medium" }, { template: "medium" }],
      spawnPoints: [
        { x: -30, z: 252 },
        { x: 30, z: 252 },
      ],
      personality: { aggression: 0.7, caution: 0.4 },
      initialOrder: "patrol",
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
  ],
  objectives,
  failConditions,
  rewards: { xp: 350, unlocks: [] },
};
