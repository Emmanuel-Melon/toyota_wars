// apps/toyota-wars/lib/missions/runtime/mission.runner.ts
import type { Mission, Vec2 } from "@/lib/missions/definition/mission.types";
import { onSquadSpawned, type MissionEffect } from "../engine/mission.effects";
import {
  beginMission,
  reduce,
  type MissionEvent,
} from "../engine/mission.reducer";
import { applySpawn, createRun, type MissionRun } from "../engine/mission.run";
import type { EventBus } from "../events/event-bus";
import type { GameEvents } from "../events/game.events";
import type { MissionHost } from "../host/mission.host";
import {
  buildSnapshot,
  createEmptySnapshot,
  type MissionSnapshot,
  type MissionZoneSnapshot,
  type ObjectiveProgressSnapshot,
} from "../direction/mission.snapshot";
import { directivesEqual } from "../direction/squad.director";

export type {
  MissionSnapshot,
  MissionZoneSnapshot,
  ObjectiveProgressSnapshot,
} from "../direction/mission.snapshot";
export type {
  DirectiveFlagsView,
  DirectiveTargetView,
  MissionNeed,
  MissionStateView,
  ObjectiveStateView,
  RouteStateView,
  SquadDirectiveType,
  SquadDirectiveView,
  SquadStateView,
  ZoneStateView,
} from "../direction/mission-view.types";

function zoneClearancePoints(zone: Mission["zones"][number]): Vec2[] {
  const { x, z } = zone.position;
  const diagonal = zone.radius / Math.SQRT2;
  return [
    zone.position,
    { x: x + zone.radius, z },
    { x: x - zone.radius, z },
    { x, z: z + zone.radius },
    { x, z: z - zone.radius },
    { x: x + diagonal, z: z + diagonal },
    { x: x + diagonal, z: z - diagonal },
    { x: x - diagonal, z: z + diagonal },
    { x: x - diagonal, z: z - diagonal },
  ];
}

function routeClearancePoints(route: readonly Vec2[]): Vec2[] {
  if (route.length <= 1) return [...route];
  const points: Vec2[] = [];
  for (let index = 1; index < route.length; index += 1) {
    const start = route[index - 1];
    const end = route[index];
    const steps = Math.max(
      1,
      Math.ceil(Math.hypot(end.x - start.x, end.z - start.z) / 24),
    );
    for (let step = 0; step <= steps; step += 1) {
      const fraction = step / steps;
      points.push({
        x: start.x + (end.x - start.x) * fraction,
        z: start.z + (end.z - start.z) * fraction,
      });
    }
  }
  return points;
}

function clearancePointsFor(mission: Mission): Vec2[] {
  return [
    ...mission.zones.flatMap(zoneClearancePoints),
    ...mission.squads.flatMap((squad) =>
      squad.route ? routeClearancePoints(squad.route) : [],
    ),
  ];
}

/**
 * Thin adapter between the game and the pure mission engine:
 * feeds events to `reduce`, performs the effects it returns on the host,
 * and publishes snapshots to React.
 */
export class MissionRunner {
  private mission: Mission | null = null;
  private run: MissionRun | null = null;

  private listeners = new Set<() => void>();
  private snapshot: MissionSnapshot = createEmptySnapshot();

  constructor(private host: MissionHost) {}

  // ── React external-store API (arrow props so they can be passed unbound) ──
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.snapshot;

  /**
   * @deprecated Push-style position feed (copies the map). Implement
   * `host.getUnitPositions` instead; when present it wins every frame.
   */
  setUnitPositions(positions: ReadonlyMap<string, Vec2>) {
    if (!this.run) return;
    this.run.unitPositions = new Map(positions);
  }

  /** Subscribe to game events. Returns a detach function. */
  attach(bus: EventBus<GameEvents>) {
    const offs = [
      bus.on("unitDestroyed", (event) =>
        this.dispatch({ type: "unitDestroyed", unitId: event.unitId }),
      ),
      bus.on("playerDestroyed", () =>
        this.dispatch({ type: "playerDestroyed" }),
      ),
    ];
    return () => offs.forEach((off) => off());
  }

  // ── Lifecycle: idle → briefing → active → success | failed ──
  load(mission: Mission) {
    this.host.cleanup?.(); // drop whatever a previous mission left in the scene
    this.mission = mission;
    this.run = createRun(mission);
    this.emit();
  }

  start() {
    if (!this.mission || !this.run || this.run.status !== "briefing") return;
    this.host.setupArena(
      this.mission.arena,
      this.mission.squads,
      clearancePointsFor(this.mission),
    );
    this.perform(beginMission(this.run, this.mission));
    this.emit();
  }

  /** Call every frame while the game is running (skip it while paused). */
  update(dt: number) {
    if (!this.mission || !this.run || this.run.status !== "active") return;
    this.syncPositions();

    const { effects, changed } = reduce(this.run, this.mission, {
      type: "tick",
      dt,
    });
    const performed = this.perform(effects);

    const second = Math.floor(this.run.elapsed);
    const nextSnapshot = buildSnapshot(this.mission, this.run);
    const directivesChanged = !directivesEqual(
      this.snapshot.directives,
      nextSnapshot.directives,
    );
    if (
      changed ||
      performed ||
      second !== this.run.lastSecond ||
      directivesChanged
    ) {
      this.run.lastSecond = second;
      this.publish(nextSnapshot);
    }
  }

  /** Leave the mission and clean up the scene. */
  reset() {
    this.host.cleanup?.();
    this.mission = null;
    this.run = null;
    this.emit();
  }

  // ── Internals ──
  private dispatch(event: MissionEvent) {
    if (!this.mission || !this.run) return;
    this.syncPositions();
    const { effects, changed } = reduce(this.run, this.mission, event);
    const performed = this.perform(effects);
    const nextSnapshot = buildSnapshot(this.mission, this.run);
    if (
      changed ||
      performed ||
      !directivesEqual(this.snapshot.directives, nextSnapshot.directives)
    )
      this.publish(nextSnapshot);
  }

  /** Pull the latest positions from the host (reference only, no copy). */
  private syncPositions() {
    const positions = this.host.getUnitPositions?.();
    if (positions && this.run) this.run.unitPositions = positions;
  }

  /** Performs effects on the host. Returns true if it changed anything the HUD shows. */
  private perform(effects: MissionEffect[]): boolean {
    const { mission, run } = this;
    if (!mission || !run) return false;

    let performed = false;
    for (const effect of effects) {
      switch (effect.type) {
        case "resetPlayerHealth":
          this.host.resetPlayerHealth?.();
          break;
        case "spawnSquad": {
          const squad = mission.squads.find((s) => s.id === effect.squadId);
          if (!squad) break;
          const spawned = this.host.spawnSquad(squad);
          applySpawn(run, mission, squad.id, spawned);
          // the squad's own onSpawned effects (announce, heal...)
          this.perform(onSquadSpawned(run, mission, squad.id));
          performed = true;
          break;
        }
      }
    }
    return performed;
  }

  private emit() {
    this.publish(buildSnapshot(this.mission, this.run));
  }

  private publish(snapshot: MissionSnapshot) {
    this.snapshot = snapshot;
    this.listeners.forEach((listener) => listener());
  }
}
