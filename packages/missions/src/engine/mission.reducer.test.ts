import { describe, expect, it } from "vitest";

import { beginMission, reduce } from "./mission.reducer";
import { applySpawn, createRun } from "./mission.run";
import { makeMission } from "../test-fixtures/mission";

describe("mission reducer", () => {
  it("spawns the opening wave and finishes when the goal is met", () => {
    const mission = makeMission();
    const run = createRun(mission, "player");

    expect(beginMission(run, mission)).toEqual([
      { type: "spawnSquad", squadId: "enemy" },
    ]);

    applySpawn(run, mission, "enemy", [{ unitId: "enemy-0", isLeader: false }]);
    const reduction = reduce(run, mission, {
      type: "unitDestroyed",
      unitId: "enemy-0",
    });

    expect(reduction.effects).toEqual([{ type: "resetPlayerHealth" }]);
    expect(run.status).toBe("success");
    expect(run.kills.enemy).toBe(1);
    expect(run.result).toMatchObject({
      outcome: "success",
      xp: 10,
    });
  });

  it("fails on player destruction", () => {
    const mission = makeMission();
    const run = createRun(mission, "player");
    beginMission(run, mission);

    expect(reduce(run, mission, { type: "playerDestroyed" })).toEqual({
      effects: [],
      changed: true,
    });
    expect(run.status).toBe("failed");
  });
});
