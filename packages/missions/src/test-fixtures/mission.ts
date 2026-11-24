import { MissionSchema } from "../missions.schema";
import type { Mission, MissionInput } from "../missions.types";

export function makeMissionInput(): MissionInput {
  return {
    id: "test-mission",
    schemaVersion: 2,
    order: 1,
    title: "Test Mission",
    briefing: "Test briefing",
    difficulty: 1,
    requires: [],
    zones: [],
    arena: {
      seed: 1,
      size: 400,
      obstacleDensity: 0,
      playerSpawn: { x: 0, z: 150 },
    },
    squads: [
      {
        id: "enemy",
        team: "enemy",
        units: [{ template: "light" }],
        spawnPoints: [{ x: 0, z: -150 }],
      },
    ],
    objectives: [
      {
        id: "win",
        title: "Destroy the enemy",
        type: "destroyCount",
        params: { team: "enemy", count: 1 },
      },
    ],
    failConditions: [{ type: "playerDestroyed" }],
    rewards: { xp: 10, unlocks: [] },
  };
}

export function makeMission(): Mission {
  return MissionSchema.parse(makeMissionInput());
}
