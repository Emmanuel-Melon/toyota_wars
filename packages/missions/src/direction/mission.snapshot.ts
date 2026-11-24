// packages/missions/src/direction/mission.snapshot.ts
import { TEAM } from "../missions.config";
import type { Mission, Team } from "../missions.types";
import { quantizeProgress, type MissionRun } from "../engine/mission.run";
import type {
  MissionNotice,
  MissionResult,
  MissionStatus,
  ObjectiveProgress,
} from "../engine/mission.run.types";
import { toMissionObjective, type MissionObjective } from "./mission.hud";
import { buildMissionStateView } from "./mission-state-view";
import type { SquadDirectiveView } from "./mission-view.types";
import { deriveSquadDirectives } from "./squad.director";

export const EMPTY_DIRECTIVES: readonly SquadDirectiveView[] = Object.freeze(
  [],
);

export interface MissionZoneSnapshot {
  readonly id: string;
  readonly controllingTeam: Team | null;
  readonly capturingTeam: Team | null;
  readonly contested: boolean;
  readonly captureProgress: number;
}

export type ObjectiveProgressSnapshot = Readonly<ObjectiveProgress>;

export interface MissionSnapshot {
  readonly status: MissionStatus;
  readonly mission: Mission | null;
  readonly elapsed: number;
  readonly zones: readonly MissionZoneSnapshot[];
  readonly objectives: readonly ObjectiveProgressSnapshot[];
  readonly activeObjective: MissionObjective | null;
  readonly directives: readonly SquadDirectiveView[];
  readonly result: MissionResult | null;
  readonly notice: MissionNotice | null;
}

export function createEmptySnapshot(): MissionSnapshot {
  return {
    status: "idle",
    mission: null,
    elapsed: 0,
    zones: [],
    objectives: [],
    activeObjective: null,
    directives: EMPTY_DIRECTIVES,
    result: null,
    notice: null,
  };
}

function withRouteTarget(
  mission: Mission,
  run: MissionRun,
  objective: MissionObjective,
): MissionObjective {
  if (objective.targetKind !== "route" || !objective.squadId) return objective;
  const progress = run.routes.get(objective.squadId);
  if (!progress) return objective;

  const squad = mission.squads.find(
    (candidate) => candidate.id === progress.squadId,
  );
  const point =
    progress.arrivedAt == null ? progress.currentPoint : progress.destination;
  return {
    ...objective,
    targetKind: "route",
    targetPoint: point,
    radius: squad?.routeRadius ?? objective.radius,
    stopDistance: squad?.routeRadius ?? objective.stopDistance,
  };
}

export function selectActiveObjective(
  mission: Mission,
  run: MissionRun,
): MissionObjective | null {
  if (run.status !== "active") return null;

  for (let i = 0; i < mission.objectives.length; i += 1) {
    const progress = run.objectives[i];
    if (
      !progress ||
      progress.status !== "pending" ||
      progress.kind !== "goal" ||
      !mission.objectives[i].required
    )
      continue;

    const objective = toMissionObjective(mission.objectives[i], mission.zones);
    if (!objective) continue;

    const owner = objective.squadId
      ? mission.squads.find((candidate) => candidate.id === objective.squadId)
      : undefined;
    return withRouteTarget(mission, run, {
      ...objective,
      team: owner?.team ?? TEAM.ALLY,
    });
  }
  return null;
}

function buildZoneSnapshots(
  mission: Mission,
  run: MissionRun,
): readonly MissionZoneSnapshot[] {
  return mission.zones.map((zone) => {
    const state = run.zoneStates.get(zone.id);
    return Object.freeze({
      id: zone.id,
      controllingTeam: state?.controllingTeam ?? null,
      capturingTeam: state?.capturingTeam ?? null,
      contested: state?.contested ?? false,
      captureProgress: quantizeProgress(state?.captureProgress ?? 0),
    });
  });
}

export function buildSnapshot(
  mission: Mission | null,
  run: MissionRun | null,
): MissionSnapshot {
  if (!mission || !run) return createEmptySnapshot();
  const directives = deriveSquadDirectives(buildMissionStateView(mission, run));
  return {
    status: run.status,
    mission,
    elapsed: Math.floor(run.elapsed),
    zones: buildZoneSnapshots(mission, run),
    objectives: run.objectives.map((objective) =>
      Object.freeze({ ...objective }),
    ),
    activeObjective: selectActiveObjective(mission, run),
    directives,
    result: run.result,
    notice: run.notice,
  };
}
