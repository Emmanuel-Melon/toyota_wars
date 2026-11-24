import type { Mission, Vec2 } from "../missions.types";
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
} from "../direction/mission.snapshot";
import { directivesEqual } from "../direction/squad.director";

export interface MissionRunnerOptions {
  playerUnitId?: string;
}

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

export class MissionRunner {
  private mission: Mission | null = null;
  private run: MissionRun | null = null;

  private listeners = new Set<() => void>();
  private snapshot: MissionSnapshot = createEmptySnapshot();

  constructor(
    private host: MissionHost,
    private options: MissionRunnerOptions = {},
  ) {}

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.snapshot;

  setUnitPositions(positions: ReadonlyMap<string, Vec2>) {
    if (!this.run) return;
    this.run.unitPositions = new Map(positions);
  }

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

  load(mission: Mission) {
    this.host.cleanup?.();
    this.mission = mission;
    this.run = createRun(mission, this.options.playerUnitId);
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

  reset() {
    this.host.cleanup?.();
    this.mission = null;
    this.run = null;
    this.emit();
  }

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

  private syncPositions() {
    const positions = this.host.getUnitPositions?.();
    if (positions && this.run) this.run.unitPositions = positions;
  }

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
