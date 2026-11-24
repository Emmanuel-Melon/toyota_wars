// packages/missions/src/direction/mission.hud.ts
import { OBJECTIVE_TYPE } from "../missions.config";
import type { MissionZone, Objective, Team, Vec2 } from "../missions.types";

export const MISSION_OBJECTIVE_KIND = {
  CAPTURE: "capture",
  DEFEND: "defend",
  ELIMINATE: "eliminate",
  ESCORT: "escort",
  REACH: "reach",
} as const;

export type MissionObjectiveKind =
  (typeof MISSION_OBJECTIVE_KIND)[keyof typeof MISSION_OBJECTIVE_KIND];

export type MissionObjectiveTargetKind = "zone" | "route" | "none";

export interface MissionObjective {
  id: string;
  kind: MissionObjectiveKind;
  team?: Team;
  squadId?: string;
  escortSquadIds?: string[];
  targetKind: MissionObjectiveTargetKind;
  targetZoneId?: string;
  targetPoint: Vec2 | null;
  radius: number;
  stopDistance?: number;
  seconds?: number;
}

type ZoneObjective = Extract<
  Objective,
  { params: { squadId: string; zoneId: string; stopDistance?: number } }
>;

function toZoneObjective(
  objective: ZoneObjective,
  kind: MissionObjectiveKind,
  zones: readonly MissionZone[],
  seconds?: number,
): MissionObjective {
  const zone = zones.find(
    (candidate) => candidate.id === objective.params.zoneId,
  );
  return {
    id: objective.id,
    kind,
    squadId: objective.params.squadId,
    targetKind: "zone",
    targetZoneId: objective.params.zoneId,
    targetPoint: zone?.position ?? null,
    radius: zone?.radius ?? 0,
    stopDistance: objective.params.stopDistance,
    seconds,
  };
}

export function toMissionObjective(
  objective: Objective,
  zones: readonly MissionZone[] = [],
): MissionObjective | null {
  switch (objective.type) {
    case OBJECTIVE_TYPE.CAPTURE:
      return toZoneObjective(objective, MISSION_OBJECTIVE_KIND.CAPTURE, zones);
    case OBJECTIVE_TYPE.REACH:
      return toZoneObjective(objective, MISSION_OBJECTIVE_KIND.REACH, zones);
    case OBJECTIVE_TYPE.DEFEND:
      return toZoneObjective(
        objective,
        MISSION_OBJECTIVE_KIND.DEFEND,
        zones,
        objective.params.seconds,
      );
    case OBJECTIVE_TYPE.ESCORT:
      return toZoneObjective(
        objective,
        MISSION_OBJECTIVE_KIND.ESCORT,
        zones,
        objective.params.seconds,
      );
    case OBJECTIVE_TYPE.ARRIVE:
      return {
        id: objective.id,
        kind: MISSION_OBJECTIVE_KIND.REACH,
        squadId: objective.params.squadId,
        escortSquadIds: objective.params.escortSquadIds,
        targetKind: "route",
        targetPoint: null,
        radius: 0,
      };
    case OBJECTIVE_TYPE.DENY_ARRIVAL:
      return null;
    case OBJECTIVE_TYPE.DESTROY_COUNT:
      return {
        id: objective.id,
        kind: MISSION_OBJECTIVE_KIND.ELIMINATE,
        targetKind: "none",
        targetPoint: null,
        radius: 0,
      };
    case OBJECTIVE_TYPE.DESTROY_SQUAD:
      return {
        id: objective.id,
        kind: MISSION_OBJECTIVE_KIND.ELIMINATE,
        squadId: objective.params.squadId,
        targetKind: "none",
        targetPoint: null,
        radius: 0,
      };
    case OBJECTIVE_TYPE.SURVIVE:
    case OBJECTIVE_TYPE.KEEP_ALIVE:
      return null;
  }
}
