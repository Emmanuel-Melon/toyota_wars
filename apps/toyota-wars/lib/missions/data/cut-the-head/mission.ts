import type { MissionInput } from "@toyota/missions";
import type { GameMissionBundle } from "../../missions.registry";
import { failConditions } from "./failure";
import { objectives } from "./success";

export const cutTheHead: MissionInput = {
  id: "cut-the-head",
  schemaVersion: 2,
  order: 3,
  title: "Cut the Head",
  briefing:
    "An enemy warband is massing under a heavy commander. Destroy the leader and the rest will lose coordination. You're outnumbered, and you have fifteen minutes.",
  difficulty: 3,
  requires: ["hold-the-line"],
  arena: {
    seed: 3003,
    size: 600,
    obstacleDensity: 0.45,
    playerSpawn: { x: 0, z: 255 },
  },
  squads: [
    {
      id: "support",
      team: "ally",
      units: [{ template: "medium" }, { template: "light" }],
      spawnPoints: [
        { x: -45, z: 264 },
        { x: 45, z: 264 },
      ],
      personality: { aggression: 0.6, caution: 0.5 },
      initialOrder: "follow",
    },
    {
      id: "intel",
      team: "ally",
      units: [{ template: "radar" }],
      spawnPoints: [{ x: 0, z: 295 }],
      personality: { aggression: 0.2, caution: 0.9 },
      initialOrder: "follow",
    },
    {
      id: "warband",
      team: "enemy",
      units: [
        {
          template: "heavy",
          isLeader: true,
          personality: { aggression: 0.4, caution: 0.7 },
        },
        { template: "medium" },
        { template: "medium" },
        { template: "light" },
        { template: "light" },
      ],
      spawnPoints: [
        { x: 0, z: -225 },
        { x: -60, z: -195 },
        { x: 60, z: -195 },
      ],
      personality: { aggression: 0.8, caution: 0.3 },
      initialOrder: "patrol",
      onSpawned: [],
      onDestroyed: [],
    },
    {
      id: "reinforcements",
      team: "enemy",
      units: [{ template: "light" }, { template: "light" }],
      spawnPoints: [
        { x: -270, z: 0 },
        { x: 270, z: 0 },
      ],
      trigger: { type: "time", atSeconds: 270 },
      personality: { aggression: 0.9, caution: 0.2 },
      initialOrder: "attack",
      onSpawned: [
        {
          type: "notice",
          title: "REINFORCEMENTS INBOUND",
          detail: "{count} HOSTILES",
        },
      ],
      onDestroyed: [],
    },
  ],
  objectives,
  failConditions,
  rewards: { xp: 350, unlocks: [] },
};

export const cutTheHeadBundle: GameMissionBundle = {
  mission: cutTheHead,
};
