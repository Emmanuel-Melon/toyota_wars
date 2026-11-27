import { describe, expect, it } from "vitest";

import { MissionCatalogSchema, MissionSchema } from "./missions.schema";
import type { MissionInput } from "./missions.types";
import { makeMissionInput } from "./test-fixtures/mission";

function makeLargeArenaInput(): MissionInput {
  const input = makeMissionInput();
  input.arena.size = 2000;
  input.arena.playerSpawn = { x: 0, z: 900 };
  input.squads[0].spawnPoints = [{ x: 0, z: -900 }];
  return input;
}

describe("mission schemas", () => {
  it("applies squad effect defaults", () => {
    const mission = MissionSchema.parse(makeMissionInput());

    expect(mission.schemaVersion).toBe(2);
    expect(mission.squads[0].onSpawned).toEqual([
      {
        type: "notice",
        title: "WAVE {wave} INCOMING",
        detail: "{count} OPPONENTS",
        finalDetail: undefined,
      },
    ]);
  });

  it("defaults timeOfDay to day", () => {
    const mission = MissionSchema.parse(makeMissionInput());

    expect(mission.timeOfDay).toBe("day");
  });

  it("defaults arena obstacle density and structures", () => {
    const input = makeMissionInput();
    delete input.arena.obstacleDensity;

    const mission = MissionSchema.parse(input);

    expect(mission.arena.obstacleDensity).toBe(0.3);
    expect(mission.arena.structures).toEqual([]);
  });

  it("applies arena structure defaults", () => {
    const input = makeMissionInput();
    input.arena.structures = [{ id: "tower", position: { x: 10, z: -20 } }];

    const mission = MissionSchema.parse(input);

    expect(mission.arena.structures).toEqual([
      {
        id: "tower",
        structure: "building",
        anchor: "world",
        position: { x: 10, z: -20 },
        yaw: 0,
        width: 12,
        depth: 10,
        height: 6,
      },
    ]);
  });

  it("parses checkpoint and base structures with anchors", () => {
    const input = makeMissionInput();
    input.arena.structures = [
      {
        id: "gate",
        structure: "checkpoint",
        anchor: "spawn",
        position: { x: 10, z: 20 },
        width: 20,
        depth: 16,
        height: 3,
      },
      {
        id: "base",
        structure: "base",
        position: { x: -20, z: 30 },
      },
    ];

    const mission = MissionSchema.parse(input);

    expect(mission.arena.structures).toEqual([
      {
        id: "gate",
        structure: "checkpoint",
        anchor: "spawn",
        position: { x: 10, z: 20 },
        yaw: 0,
        width: 20,
        depth: 16,
        height: 3,
      },
      {
        id: "base",
        structure: "base",
        anchor: "world",
        position: { x: -20, z: 30 },
        yaw: 0,
        width: 12,
        depth: 10,
        height: 6,
      },
    ]);
  });

  it("applies spawn anchor defaults and keeps spawn yaw", () => {
    const input = makeMissionInput();
    input.arena.structures = [
      { id: "gate", structure: "checkpoint", position: { x: 0, z: -150 } },
    ];
    input.squads[0].spawnPoints = [{ x: 0, z: -150, yaw: 0.5 }];
    input.squads[0].spawnAnchor = { structureId: "gate", role: "vehicle" };

    const mission = MissionSchema.parse(input);

    expect(mission.squads[0].spawnAnchor).toEqual({
      structureId: "gate",
      role: "vehicle",
      holdPosition: true,
    });
    expect(mission.squads[0].spawnPoints).toEqual([
      { x: 0, z: -150, yaw: 0.5 },
    ]);
  });

  it("rejects spawn anchors without checkpoint structures", () => {
    const input = makeMissionInput();
    input.squads[0].spawnAnchor = { structureId: "missing", role: "vehicle" };

    expect(() => MissionSchema.parse(input)).toThrow(/unknown structure/);
  });

  it("rejects spawn anchors on non-checkpoint structures", () => {
    const input = makeMissionInput();
    input.arena.structures = [{ id: "tower", position: { x: 0, z: -150 } }];
    input.squads[0].spawnAnchor = { structureId: "tower", role: "vehicle" };

    expect(() => MissionSchema.parse(input)).toThrow(/checkpoint structure/);
  });

  it("rejects invalid arena structures", () => {
    const input = makeMissionInput();
    input.arena.structures = [{ id: "Invalid_ID", position: { x: 0, z: 0 } }];

    expect(() => MissionSchema.parse(input)).toThrow();
  });

  it.each(["dawn", "day", "dusk", "night"] as const)(
    "parses %s missions",
    (timeOfDay) => {
      const input = makeMissionInput();
      input.timeOfDay = timeOfDay;

      const mission = MissionSchema.parse(input);

      expect(mission.timeOfDay).toBe(timeOfDay);
    },
  );

  it("rejects unknown times of day", () => {
    const input = { ...makeMissionInput(), timeOfDay: "noon" };

    expect(() => MissionSchema.parse(input)).toThrow();
  });

  it("rejects objectives that reference unknown zones", () => {
    const input = makeMissionInput();
    input.objectives = [
      {
        id: "win",
        title: "Capture",
        type: "capture",
        params: { squadId: "enemy", zoneId: "missing" },
      },
    ];

    expect(() => MissionSchema.parse(input)).toThrow(/Unknown zone/);
  });

  it("rejects catalogs with unknown mission requirements", () => {
    const first = makeMissionInput();
    const second = makeMissionInput();
    second.id = "second-mission";
    second.requires = ["missing-mission"];

    expect(() => MissionCatalogSchema.parse([first, second])).toThrow(
      /Unknown mission/,
    );
  });

  it("rejects arena sizes outside supported bounds", () => {
    const tooSmall = makeMissionInput();
    tooSmall.arena.size = 99;
    tooSmall.arena.playerSpawn = { x: 0, z: 30 };
    tooSmall.squads[0].spawnPoints = [{ x: 0, z: -30 }];

    expect(() => MissionSchema.parse(tooSmall)).toThrow();

    const tooLarge = makeLargeArenaInput();
    tooLarge.arena.size = 4001;
    tooLarge.arena.playerSpawn = { x: 0, z: 1500 };
    tooLarge.squads[0].spawnPoints = [{ x: 0, z: -1500 }];

    expect(() => MissionSchema.parse(tooLarge)).toThrow();
  });

  it("rejects large-arena spawns outside the engagement band", () => {
    const tooClose = makeLargeArenaInput();
    tooClose.arena.playerSpawn = { x: 0, z: 100 };
    tooClose.squads[0].spawnPoints = [{ x: 0, z: -100 }];

    expect(() => MissionSchema.parse(tooClose)).toThrow(/too close together/);

    const tooFar = makeLargeArenaInput();
    tooFar.arena.playerSpawn = { x: 1000, z: 1000 };
    tooFar.squads[0].spawnPoints = [{ x: -1000, z: -1000 }];

    expect(() => MissionSchema.parse(tooFar)).toThrow(/too far apart/);
  });
});
