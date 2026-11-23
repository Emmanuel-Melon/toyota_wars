// apps/toyota-wars/lib/missions/data/hold-the-line/mission.ts
import type { MissionInput } from "../../definition/mission.types";
import { waveEffects } from "../../definition/mission.presets";
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
      id: "wave-1",
      team: "enemy",
      units: [
        { template: "light" },
        { template: "light" },
        { template: "medium" },
      ],
      spawnPoints: [
        { x: -150, z: -240 },
        { x: 0, z: -270 },
        { x: 150, z: -240 },
      ],
      trigger: { type: "time", atSeconds: 30 },
      personality: { aggression: 0.6, caution: 0.4 },
      initialOrder: "attack",
      ...waveEffects(),
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
      trigger: { type: "squadDestroyed", squadId: "wave-1", delaySeconds: 24 },
      personality: { aggression: 0.7, caution: 0.3 },
      initialOrder: "attack",
      ...waveEffects(),
    },
  ],
  objectives,
  failConditions,
  rewards: { xp: 200, unlocks: ["cut-the-head"] },
};
