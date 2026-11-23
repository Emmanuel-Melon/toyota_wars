import {
  OBJECTIVE_TYPE,
  TEAM,
} from "@/lib/missions/definition/mission.constants";
import type {
  Mission,
  Objective,
  Team,
  Vec2,
} from "@/lib/missions/definition/mission.types";
import {
  alivePositions,
  quantizeProgress,
  type MissionRun,
} from "../engine/mission.run";
import type {
  MissionNeed,
  MissionStateView,
  ObjectiveStateView,
  RouteStateView,
  SquadStateView,
  ZoneStateView,
} from "./mission-view.types";

function copyPoint(point: Vec2): Vec2 {
  return Object.freeze({ x: point.x, z: point.z });
}

function teamForSquad(mission: Mission, squadId: string, fallback: Team): Team {
  return mission.squads.find((squad) => squad.id === squadId)?.team ?? fallback;
}

function needForObjective(mission: Mission, objective: Objective): MissionNeed {
  switch (objective.type) {
    case OBJECTIVE_TYPE.DESTROY_COUNT:
      return {
        type: "eliminate",
        team: objective.params.team,
        remaining: objective.params.count,
      };
    case OBJECTIVE_TYPE.DESTROY_SQUAD:
      return {
        type: "eliminate",
        team: teamForSquad(mission, objective.params.squadId, TEAM.ENEMY),
        squadId: objective.params.squadId,
        remaining: 1,
      };
    case OBJECTIVE_TYPE.SURVIVE:
      return { type: "survive", seconds: objective.params.seconds };
    case OBJECTIVE_TYPE.KEEP_ALIVE:
      return {
        type: "preserve-squad",
        squadId: objective.params.squadId,
        minAlive: objective.params.minAlive,
      };
    case OBJECTIVE_TYPE.CAPTURE:
      return {
        type: "control-zone",
        zoneId: objective.params.zoneId,
        stopDistance: objective.params.stopDistance,
        team: TEAM.ALLY,
      };
    case OBJECTIVE_TYPE.DEFEND:
      return {
        type: "hold-zone",
        zoneId: objective.params.zoneId,
        stopDistance: objective.params.stopDistance,
        team: TEAM.ALLY,
        seconds: objective.params.seconds,
      };
    case OBJECTIVE_TYPE.REACH:
      return {
        type: "occupy-zone",
        zoneId: objective.params.zoneId,
        stopDistance: objective.params.stopDistance,
        squadId: objective.params.squadId,
      };
    case OBJECTIVE_TYPE.ESCORT:
      return {
        type: "presence",
        zoneId: objective.params.zoneId,
        stopDistance: objective.params.stopDistance,
        squadId: objective.params.squadId,
        seconds: objective.params.seconds,
      };
    case OBJECTIVE_TYPE.ARRIVE:
      return { type: "reach-route", squadId: objective.params.squadId };
    case OBJECTIVE_TYPE.DENY_ARRIVAL:
      return { type: "deny-route", squadId: objective.params.squadId };
  }
}

function buildObjectives(
  mission: Mission,
  run: MissionRun,
): readonly ObjectiveStateView[] {
  return Object.freeze(
    mission.objectives.map((objective, index) => {
      const progress = run.objectives[index];
      const current = progress?.current ?? 0;
      const target = progress?.target ?? 1;
      const need = needForObjective(mission, objective);
      return Object.freeze({
        id: objective.id,
        title: objective.title,
        type: objective.type,
        kind: progress?.kind ?? "goal",
        status: progress?.status ?? "pending",
        current,
        target,
        progress: progress?.progress ?? 0,
        required: objective.required,
        hidden: objective.hidden,
        need: Object.freeze(
          need.type === "eliminate"
            ? { ...need, remaining: Math.max(0, target - current) }
            : need,
        ) as MissionNeed,
      });
    }),
  );
}

function buildZones(
  mission: Mission,
  run: MissionRun,
): readonly ZoneStateView[] {
  return Object.freeze(
    mission.zones.map((zone) => {
      const state = run.zoneStates.get(zone.id);
      return Object.freeze({
        id: zone.id,
        position: copyPoint(zone.position),
        radius: zone.radius,
        controllingTeam: state?.controllingTeam ?? null,
        capturingTeam: state?.capturingTeam ?? null,
        contested: state?.contested ?? false,
        captureProgress: quantizeProgress(state?.captureProgress ?? 0),
      });
    }),
  );
}

function squadCenter(run: MissionRun, squadId: string): Vec2 | null {
  const positions = alivePositions(run, squadId);
  if (positions.length === 0) return null;
  let x = 0;
  let z = 0;
  for (const position of positions) {
    x += position.x;
    z += position.z;
  }
  return Object.freeze({
    x: x / positions.length,
    z: z / positions.length,
  });
}

function buildSquads(
  mission: Mission,
  run: MissionRun,
): readonly SquadStateView[] {
  return Object.freeze(
    mission.squads.map((squad) => {
      const tracker = run.squads.get(squad.id);
      return Object.freeze({
        id: squad.id,
        team: squad.team,
        spawned: tracker?.spawned ?? false,
        alive: tracker?.alive ?? 0,
        total: tracker?.total ?? squad.units.length,
        center: squadCenter(run, squad.id),
      });
    }),
  );
}

function buildRoutes(
  mission: Mission,
  run: MissionRun,
): readonly RouteStateView[] {
  const routes: RouteStateView[] = [];
  for (const squad of mission.squads) {
    const route = run.routes.get(squad.id);
    if (!route) continue;
    routes.push(
      Object.freeze({
        squadId: route.squadId,
        team: squad.team,
        currentPoint: copyPoint(route.currentPoint),
        destination: copyPoint(route.destination),
        waypointIndex: route.waypointIndex,
        waypointCount: route.waypointCount,
        arrivedAt: route.arrivedAt,
        radius: squad.routeRadius,
      }),
    );
  }
  return Object.freeze(routes);
}

export function buildMissionStateView(
  mission: Mission,
  run: MissionRun,
): MissionStateView {
  return Object.freeze({
    status: run.status,
    elapsed: run.elapsed,
    objectives: buildObjectives(mission, run),
    zones: buildZones(mission, run),
    squads: buildSquads(mission, run),
    routes: buildRoutes(mission, run),
  });
}
