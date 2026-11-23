import type { MissionInput } from "../../definition/mission.types";
import { noEffects } from "../../definition/mission.presets";
import { failConditions } from "./failure";
import { objectives } from "./success";

export const tutorial: MissionInput = {
  id: "how-to-play",
  schemaVersion: 2,
  order: 0,
  title: "How to Play",
  briefing:
    "Practice driving, firing, and commanding your squad in a low-threat training exercise.",
  difficulty: 1,
  requires: [],
  arena: {
    seed: 3003,
    size: 600,
    obstacleDensity: 0.15,
    playerSpawn: { x: 0, z: 240 },
  },
  squads: [
    {
      id: "training-crew",
      team: "ally",
      units: [{ template: "medium", isLeader: true }, { template: "medium" }],
      spawnPoints: [
        { x: -36, z: 258 },
        { x: 36, z: 258 },
      ],
      personality: { aggression: 0.2, caution: 0.8 },
      initialOrder: "follow",
      ...noEffects(),
    },
    {
      id: "training-targets",
      team: "enemy",
      units: [{ template: "light" }, { template: "light" }],
      spawnPoints: [
        { x: -90, z: -165 },
        { x: 90, z: -165 },
      ],
      personality: { aggression: 0.1, caution: 0.9 },
      initialOrder: "patrol",
      ...noEffects(),
    },
  ],
  objectives,
  failConditions,
  rewards: { xp: 0, unlocks: [] },
};
