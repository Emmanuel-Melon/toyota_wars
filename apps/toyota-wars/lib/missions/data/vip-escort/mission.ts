import type { MissionInput } from "../../definition/mission.types";
import { noEffects } from "../../definition/mission.presets";
import { failConditions } from "./failure";
import { objectives } from "./success";
import { ROAD_WAYPOINTS, VIP_ROUTE } from "./zones";

export const vipEscort: MissionInput = {
  id: "vip-escort",
  schemaVersion: 2,
  order: 6,
  title: "VIP Escort",
  briefing:
    "A command vehicle must reach the southern extraction point. Keep it alive, clear the ambush corridor, and stay with it as it moves.",
  difficulty: 4,
  requires: [],
  arena: {
    seed: 6006,
    size: 600,
    obstacleDensity: 0.3,
    playerSpawn: { x: 0, z: 240 },
    roads: {
      waypoints: ROAD_WAYPOINTS,
      width: 28,
    },
  },
  squads: [
    {
      id: "vip",
      team: "ally",
      units: [{ template: "medium", isLeader: true }],
      spawnPoints: [{ x: -24, z: 246 }],
      personality: { aggression: 0.25, caution: 0.85 },
      initialOrder: "follow",
      route: VIP_ROUTE,
      routeRadius: 30,
      ...noEffects(),
    },
    {
      id: "escort",
      team: "ally",
      units: [
        { template: "medium" },
        { template: "medium" },
        { template: "light" },
      ],
      spawnPoints: [
        { x: 24, z: 252 },
        { x: 42, z: 252 },
        { x: -42, z: 252 },
      ],
      personality: { aggression: 0.6, caution: 0.5 },
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
      id: "north-ambush",
      team: "enemy",
      units: [
        { template: "medium" },
        { template: "medium" },
        { template: "light" },
      ],
      spawnPoints: [
        { x: -36, z: 0 },
        { x: 36, z: -15 },
        { x: 0, z: -45 },
      ],
      personality: { aggression: 0.7, caution: 0.35 },
      initialOrder: "patrol",
      ...noEffects(),
    },
    {
      id: "extraction-blockade",
      team: "enemy",
      units: [
        { template: "medium" },
        { template: "medium" },
        { template: "medium" },
      ],
      spawnPoints: [
        { x: -144, z: -255 },
        { x: -90, z: -276 },
        { x: -36, z: -255 },
      ],
      personality: { aggression: 0.75, caution: 0.4 },
      initialOrder: "patrol",
      ...noEffects(),
    },
  ],
  objectives,
  failConditions,
  rewards: { xp: 350, unlocks: [] },
};
