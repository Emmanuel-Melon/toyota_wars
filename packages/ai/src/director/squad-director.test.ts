import { describe, expect, it } from "vitest";

import type {
  MissionStateView,
  SquadDirectiveView,
} from "./mission-directive.types";
import { deriveSquadDirectives, directivesEqual } from "./squad-director";

const baseView: MissionStateView = {
  status: "active",
  elapsed: 0,
  objectives: [
    {
      id: "destroy-enemy",
      title: "Destroy enemy",
      type: "destroyCount",
      kind: "goal",
      status: "pending",
      current: 0,
      target: 1,
      progress: 0,
      required: true,
      hidden: false,
      need: { type: "eliminate", team: "enemy", remaining: 1 },
    },
  ],
  zones: [],
  squads: [
    {
      id: "alpha",
      team: "ally",
      spawned: true,
      alive: 2,
      total: 2,
      center: { x: 0, z: 0 },
    },
  ],
  routes: [],
};

describe("deriveSquadDirectives", () => {
  it("derives engagement from an eliminate need", () => {
    const [directive] = deriveSquadDirectives(baseView);

    expect(directive.squadId).toBe("alpha");
    expect(directive.directive).toBe("engage");
    expect(directive.flags.primary).toBe(true);
  });

  it("falls back to hold when the mission is not active", () => {
    const [directive] = deriveSquadDirectives({ ...baseView, status: "idle" });

    expect(directive.directive).toBe("hold");
    expect(directive.target.kind).toBe("none");
  });
});

describe("directivesEqual", () => {
  it("compares directive values instead of object identity", () => {
    const a: SquadDirectiveView[] = [
      {
        squadId: "alpha",
        directive: "hold",
        target: { kind: "none", point: null },
        flags: {},
      },
    ];
    const b: SquadDirectiveView[] = [
      {
        squadId: "alpha",
        directive: "hold",
        target: { kind: "none", point: null },
        flags: {},
      },
    ];

    expect(directivesEqual(a, b)).toBe(true);
    expect(directivesEqual(a, deriveSquadDirectives(baseView))).toBe(false);
  });
});
