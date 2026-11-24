import { describe, expect, it } from "vitest";

import { MissionCatalogSchema, MissionSchema } from "./missions.schema";
import { makeMissionInput } from "./test-fixtures/mission";

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
});
