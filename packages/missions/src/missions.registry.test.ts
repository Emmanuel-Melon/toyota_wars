import { describe, expect, it, vi } from "vitest";

import { createMissionsRegistry } from "./missions.registry";

describe("createMissionsRegistry", () => {
  it("registers entries keyed by id", () => {
    const registry = createMissionsRegistry<{ label: string }>();
    const first = { label: "first" };
    const second = { label: "second" };

    registry.register("first", first);
    registry.register("second", second);

    expect(registry.get("first")).toBe(first);
    expect(registry.require("second")).toBe(second);
    expect(registry.all()).toEqual([first, second]);
    expect(registry.ids()).toEqual(["first", "second"]);
  });

  it("warns when an id is registered twice", () => {
    const registry = createMissionsRegistry<string>();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    registry.register("mission", "first");
    registry.register("mission", "second");

    expect(warn).toHaveBeenCalledWith(
      '[MissionsRegistry] Overwriting existing mission registration for id "mission".',
    );
    expect(registry.require("mission")).toBe("second");
    warn.mockRestore();
  });

  it("throws when a required id is missing", () => {
    const registry = createMissionsRegistry<string>();

    expect(() => registry.require("missing")).toThrow(
      '[MissionsRegistry] No mission registered with id "missing". Ensure mission modules are imported during initialization.',
    );
  });

  it("returns defensive snapshots", () => {
    const registry = createMissionsRegistry<string>();
    registry.register("first", "one");

    const entries = registry.all();
    const ids = registry.ids();
    entries.pop();
    ids.pop();

    expect(registry.all()).toEqual(["one"]);
    expect(registry.ids()).toEqual(["first"]);
  });

  it("resets registered entries", () => {
    const registry = createMissionsRegistry<string>();
    registry.register("first", "one");

    registry.reset();

    expect(registry.all()).toEqual([]);
    expect(registry.ids()).toEqual([]);
  });
});
