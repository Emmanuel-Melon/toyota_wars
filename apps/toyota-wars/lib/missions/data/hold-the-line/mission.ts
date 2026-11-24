// apps/toyota-wars/lib/missions/data/hold-the-line/mission.ts
import type { MissionInput } from "@toyota/missions";
import { waveEffects } from "@toyota/missions";
import { failConditions } from "./failure";
import { objectives } from "./success";

export const holdTheLine: MissionInput = {
  id: "hold-the-line",
  schemaVersion: 2,
  order: 2,
  title: "Hold the Line",
  briefing:
    "Two allied tanks are joining you. Enemy forces are pushing through in waves. Stay alive until reinforcements arrive, and try to bring your allies home.",
  difficulty: 2,
  requires: ["first-contact"],
  arena: {
    seed: 2002,
    size: 600,
    obstacleDensity: 0.3,
    playerSpawn: { x: 0, z: 240 },
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
      personality: { aggression: 0.5, caution: 0.6 },
      initialOrder: "follow",
    },
    {
      id: "intel",
      team: "ally",
      units: [{ template: "radar" }],
      spawnPoints: [{ x: 0, z: 290 }],
      personality: { aggression: 0.2, caution: 0.9 },
      initialOrder: "follow",
    },
    {
      id: "opening-artillery",
      team: "enemy",
      units: [
        { template: "heavy" },
        { template: "heavy" },
        { template: "heavy" },
      ],
      spawnPoints: [
        { x: -106, z: -260 },
        { x: -90, z: -260 },
        { x: -74, z: -260 },
      ],
      spawnLayout: "authored",
      formation: "line",
      spacing: 16,
      fireMode: "scripted",
      trigger: { type: "start" },
      personality: { aggression: 0.35, caution: 0.7 },
      initialOrder: "patrol",
      onSpawned: [
        {
          type: "notice",
          title: "TYPE 63 SUPPORT",
          detail: "Enemy artillery is firing in from the flank.",
        },
      ],
      onDestroyed: [],
    },
    {
      id: "opening-vanguard",
      team: "enemy",
      units: [
        { template: "medium", isLeader: true },
        { template: "medium" },
        { template: "medium" },
      ],
      spawnPoints: [
        { x: -90, z: -220 },
        { x: -97.5, z: -230 },
        { x: -82.5, z: -230 },
      ],
      spawnLayout: "authored",
      formation: "wedge",
      spacing: 10,
      holdFormation: true,
      trigger: { type: "time", atSeconds: 6 },
      personality: { aggression: 0.65, caution: 0.35 },
      initialOrder: "attack",
      onSpawned: [
        {
          type: "notice",
          title: "ZU-23 WEDGE",
          detail: "A wedge of autocannons is advancing.",
        },
      ],
      onDestroyed: [],
    },
    {
      id: "wave-2",
      team: "enemy",
      units: [
        { template: "medium" },
        { template: "medium" },
        { template: "light" },
        { template: "light" },
      ],
      spawnPoints: [
        { x: -210, z: -120 },
        { x: 210, z: -120 },
      ],
      trigger: {
        type: "squadDestroyed",
        squadId: "opening-vanguard",
        delaySeconds: 24,
      },
      personality: { aggression: 0.7, caution: 0.3 },
      initialOrder: "attack",
      ...waveEffects(),
    },
  ],
  objectives,
  failConditions,
  rewards: { xp: 200, unlocks: ["cut-the-head"] },
};
