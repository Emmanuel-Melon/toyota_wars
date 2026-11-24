import { describe, expect, it, vi } from "vitest";

import { createGameEventBus } from "../events/game.events";
import type { MissionHost } from "../host/mission.host";
import { makeMission } from "../test-fixtures/mission";
import { MissionRunner } from "./mission.runner";

describe("MissionRunner", () => {
  it("loads, starts, and reacts to mission events", () => {
    const mission = makeMission();
    const host: MissionHost = {
      setupArena: vi.fn(),
      spawnSquad: vi.fn(() => [{ unitId: "enemy-0", isLeader: false }]),
      cleanup: vi.fn(),
      resetPlayerHealth: vi.fn(),
      getUnitPositions: () => new Map([["enemy-0", { x: 0, z: -150 }]]),
    };
    const bus = createGameEventBus();
    const listener = vi.fn();
    const runner = new MissionRunner(host, { playerUnitId: "player" });
    const detach = runner.attach(bus);
    const unsubscribe = runner.subscribe(listener);

    runner.load(mission);
    expect(runner.getSnapshot().status).toBe("briefing");

    runner.start();
    expect(host.setupArena).toHaveBeenCalledOnce();
    expect(host.spawnSquad).toHaveBeenCalledOnce();
    expect(runner.getSnapshot().status).toBe("active");

    bus.emit("unitDestroyed", { unitId: "enemy-0" });
    expect(host.resetPlayerHealth).toHaveBeenCalledOnce();
    expect(runner.getSnapshot().status).toBe("success");

    detach();
    unsubscribe();
  });

  it("clears the mission on reset", () => {
    const mission = makeMission();
    const host: MissionHost = {
      setupArena: vi.fn(),
      spawnSquad: vi.fn(() => []),
      cleanup: vi.fn(),
    };
    const runner = new MissionRunner(host);

    runner.load(mission);
    runner.reset();

    expect(host.cleanup).toHaveBeenCalledTimes(2);
    expect(runner.getSnapshot().status).toBe("idle");
  });
});
