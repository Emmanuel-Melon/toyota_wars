// lib/missions/engine/objectives/objective.types.ts
import type {
  ObjectiveKind,
  ObjectiveType,
} from "@/lib/missions/definition/mission.constants";
import type {
  MissionZone,
  Objective,
  ObjectiveOf,
  Team,
  Vec2,
} from "@/lib/missions/definition/mission.types";
import type {
  ObjectiveStatus,
  RouteProgress,
  SquadTracker,
  ZoneRuntimeState,
} from "../mission.run.types";

/** Evaluator contracts only. Run-state types live in ../mission.run.types. */

/** Everything an evaluator may read. The run state owns and updates it. */
export interface ObjectiveContext {
  elapsed: number;
  kills: Record<Team, number>; // units destroyed per team
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
  /**
   * goal: completes on its own (destroy, survive, capture...).
   * constraint: can only fail; it resolves to "complete" if the mission
   * is won without failing it.
   */
  kind: ObjectiveKind;
  isHolding?(objective: O, ctx: ObjectiveContext): boolean;
  evaluate(objective: O, ctx: ObjectiveContext): Evaluation;
}

/** Registry shape: one evaluator per objective type, fully mapped. */
export type ObjectiveEvaluatorRegistry = {
  [K in ObjectiveType]: ObjectiveEvaluator<ObjectiveOf<K>>;
};

/**
 * Compatibility re-exports: these used to be declared here. Import them from
 * "../mission.run.types" instead; remove this block once nothing imports them from here.
 */
export type {
  MissionNotice,
  MissionResult,
  MissionStatus,
  ObjectiveProgress,
  ObjectiveStatus,
  ScheduledSpawn,
  SquadTracker,
  TrackedUnit,
} from "../mission.run.types";
