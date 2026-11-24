import type { ObjectiveKind, ObjectiveType } from "../../missions.config";
import type {
  MissionZone,
  Objective,
  ObjectiveOf,
  Team,
  Vec2,
} from "../../missions.types";
import type {
  ObjectiveStatus,
  RouteProgress,
  SquadTracker,
  ZoneRuntimeState,
} from "../mission.run.types";

export interface ObjectiveContext {
  elapsed: number;
  kills: Record<Team, number>;
  squad(id: string): SquadTracker | undefined;
  positions(squadId: string): Vec2[];
  zone(zoneId: string): MissionZone | undefined;
  zoneState(zoneId: string): ZoneRuntimeState | undefined;
  route(squadId: string): RouteProgress | undefined;
  holdSeconds(objectiveId: string): number;
}

export interface Evaluation {
  status: ObjectiveStatus;
  current: number;
  target: number;
  progress: number;
}

export interface ObjectiveEvaluator<O extends Objective = Objective> {
  kind: ObjectiveKind;
  isHolding?(objective: O, ctx: ObjectiveContext): boolean;
  evaluate(objective: O, ctx: ObjectiveContext): Evaluation;
}

export type ObjectiveEvaluatorRegistry = {
  [K in ObjectiveType]: ObjectiveEvaluator<ObjectiveOf<K>>;
};
