import { OBJECTIVE_KIND, TEAM } from "../missions.config";
import type { Mission, Team, Vec2 } from "../missions.types";
import type {
  MissionNotice,
  MissionResult,
  MissionStatus,
  ObjectiveProgress,
  RouteProgress,
  ScheduledSpawn,
  SquadTracker,
  TrackedUnit,
  ZoneRuntimeState,
} from "./mission.run.types";

export interface MissionRun {
  status: MissionStatus;
  elapsed: number;
  lastSecond: number;
  lastEvaluatedElapsed: number;
  kills: Record<Team, number>;
  squads: Map<string, SquadTracker>;
  units: Map<string, TrackedUnit>;
  pendingSpawns: ScheduledSpawn[];
  routes: Map<string, RouteProgress>;
  zoneStates: Map<string, ZoneRuntimeState>;
  objectives: ObjectiveProgress[];
  objectiveHolds: Map<string, number>;
  unitPositions: ReadonlyMap<string, Vec2>;
  notice: MissionNotice | null;
  noticeId: number;
  result: MissionResult | null;
  playerUnitId: string;
}

export function createRun(
  mission: Mission,
  playerUnitId = "player",
): MissionRun {
  const routes = new Map<string, RouteProgress>();
  for (const squad of mission.squads) {
    if (!squad.route || squad.route.length === 0) continue;
    routes.set(squad.id, {
      squadId: squad.id,
      waypointIndex: 0,
      waypointCount: squad.route.length,
      arrivedAt: null,
      currentPoint: squad.route[0],
      destination: squad.route[squad.route.length - 1],
    });
  }

  return {
    status: "briefing",
    elapsed: 0,
    lastSecond: -1,
    lastEvaluatedElapsed: 0,
    kills: { ally: 0, enemy: 0 },
    squads: new Map(
      mission.squads.map((s) => [
        s.id,
        {
          spawned: false,
          total: s.units.length,
          alive: 0,
          leadersTotal: 0,
          leadersAlive: 0,
        } satisfies SquadTracker,
      ]),
    ),
    units: new Map(),
    pendingSpawns: [],
    routes,
    zoneStates: new Map(
      mission.zones.map((zone) => [
        zone.id,
        {
          controllingTeam: null,
          capturingTeam: null,
          captureProgress: 0,
          contested: false,
        } satisfies ZoneRuntimeState,
      ]),
    ),
    objectives: mission.objectives.map((o) => ({
      id: o.id,
      title: o.title,
      required: o.required,
      hidden: o.hidden,
      kind: OBJECTIVE_KIND[o.type],
      status: "pending",
      current: 0,
      target: 1,
      progress: 0,
    })),
    objectiveHolds: new Map(),
    unitPositions: new Map(),
    notice: null,
    noticeId: 0,
    result: null,
    playerUnitId,
  };
}

export function quantizeProgress(value: number): number {
  return Math.round(Math.min(1, Math.max(0, value)) * 100) / 100;
}

const isInsideZone = (point: Vec2, zone: Mission["zones"][number]): boolean =>
  Math.hypot(point.x - zone.position.x, point.z - zone.position.z) <=
  zone.radius;

function zoneOccupants(
  run: MissionRun,
  zone: Mission["zones"][number],
): Record<Team, number> {
  const counts: Record<Team, number> = { ally: 0, enemy: 0 };
  for (const [unitId, unit] of run.units) {
    if (!unit.alive) continue;
    const position = run.unitPositions.get(unitId);
    if (position && isInsideZone(position, zone)) counts[unit.team] += 1;
  }
  const playerPosition = run.unitPositions.get(run.playerUnitId);
  if (playerPosition && isInsideZone(playerPosition, zone)) counts.ally += 1;
  return counts;
}

const zoneSignature = (state: ZoneRuntimeState): string =>
  `${state.controllingTeam}:${state.capturingTeam}:${state.contested}:${quantizeProgress(state.captureProgress)}`;

export function updateZones(
  run: MissionRun,
  mission: Mission,
  dt: number,
): boolean {
  let changed = false;
  for (const zone of mission.zones) {
    let state = run.zoneStates.get(zone.id);
    if (!state) {
      state = {
        controllingTeam: null,
        capturingTeam: null,
        captureProgress: 0,
        contested: false,
      };
      run.zoneStates.set(zone.id, state);
    }

    const before = zoneSignature(state);
    const occupants = zoneOccupants(run, zone);
    const contested = occupants.ally > 0 && occupants.enemy > 0;
    state.contested = contested;

    if (!contested) {
      const capturingTeam: Team | null =
        occupants.ally > 0 && occupants.enemy === 0
          ? TEAM.ALLY
          : occupants.enemy > 0 && occupants.ally === 0
            ? TEAM.ENEMY
            : null;

      if (capturingTeam) {
        if (state.capturingTeam !== capturingTeam) {
          state.capturingTeam = capturingTeam;
          state.captureProgress = 0;
        }
        state.captureProgress = quantizeProgress(
          state.captureProgress + dt / zone.captureSeconds,
        );
        if (state.captureProgress >= 1) {
          state.controllingTeam = capturingTeam;
          state.capturingTeam = capturingTeam;
          state.captureProgress = 1;
        }
      }
    }

    if (zoneSignature(state) !== before) changed = true;
  }
  return changed;
}

export function alivePositions(run: MissionRun, squadId: string): Vec2[] {
  const positions: Vec2[] = [];
  for (const [unitId, unit] of run.units) {
    if (unit.squadId !== squadId || !unit.alive) continue;
    const position = run.unitPositions.get(unitId);
    if (position) positions.push(position);
  }
  return positions;
}

export function updateRoutes(run: MissionRun, mission: Mission): boolean {
  let changed = false;
  for (const squad of mission.squads) {
    const progress = run.routes.get(squad.id);
    const route = squad.route;
    if (!progress || !route || progress.arrivedAt !== null) continue;

    const positions = alivePositions(run, squad.id);
    if (positions.length === 0) continue;

    const reached = (point: Vec2) =>
      positions.some(
        (p) => Math.hypot(p.x - point.x, p.z - point.z) <= squad.routeRadius,
      );

    let index = progress.waypointIndex;
    while (index < route.length - 1 && reached(route[index])) {
      index += 1;
    }

    if (index !== progress.waypointIndex) {
      progress.waypointIndex = index;
      progress.currentPoint = route[index];
      changed = true;
    }

    if (index === route.length - 1 && reached(route[index])) {
      progress.arrivedAt = run.elapsed;
      changed = true;
    }
  }
  return changed;
}

export function enemyWaveNumber(mission: Mission, squadId: string): number {
  return (
    mission.squads
      .filter((s) => s.team === TEAM.ENEMY)
      .findIndex((s) => s.id === squadId) + 1
  );
}

export function setNotice(
  run: MissionRun,
  title: string,
  detail: string,
  duration = 6,
): void {
  run.noticeId += 1;
  run.notice = {
    id: run.noticeId,
    title,
    detail,
    expiresAt: run.elapsed + duration,
  };
}

export function applySpawn(
  run: MissionRun,
  mission: Mission,
  squadId: string,
  spawned: { unitId: string; isLeader: boolean }[],
): void {
  const squad = mission.squads.find((s) => s.id === squadId);
  const tracker = run.squads.get(squadId);
  if (!squad || !tracker || tracker.spawned) return;

  tracker.spawned = true;
  tracker.total = spawned.length;
  tracker.alive = spawned.length;
  tracker.leadersTotal = spawned.filter((u) => u.isLeader).length;
  tracker.leadersAlive = tracker.leadersTotal;

  for (const u of spawned) {
    run.units.set(u.unitId, {
      squadId,
      team: squad.team,
      isLeader: u.isLeader,
      alive: true,
    });
  }
}
