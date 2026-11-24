// packages/ai/src/director/squad-assignment.ts
import type {
  DirectiveTargetView,
  MissionNeed,
  MissionStateView,
  ObjectiveStateView,
  SquadDirectiveView,
  SquadStateView,
} from "./mission-directive.types";
import {
  compareIds,
  distance,
  type TeamLike,
  type Vec2Like,
} from "./director.utils";
import { preferredSquadId } from "./need-resolver";

export type Assignment = {
  directive: SquadDirectiveView;
  rank: number;
};

export function objectiveRank(objective: ObjectiveStateView): number {
  if (objective.kind !== "goal") return 2;
  return objective.required ? 0 : 1;
}

export function orderedObjectives(
  view: MissionStateView,
): readonly ObjectiveStateView[] {
  return view.objectives
    .map((objective, index) => ({ objective, index }))
    .filter(({ objective }) => objective.status === "pending")
    .sort((a, b) => {
      const rank = objectiveRank(a.objective) - objectiveRank(b.objective);
      if (rank !== 0) return rank;
      const progress = b.objective.progress - a.objective.progress;
      if (progress !== 0) return progress;
      const current = b.objective.current - a.objective.current;
      if (current !== 0) return current;
      return a.index - b.index;
    })
    .map(({ objective }) => objective);
}

function eligibleSquads(
  view: MissionStateView,
  team: TeamLike,
): readonly SquadStateView[] {
  return view.squads.filter(
    (squad) => squad.team === team && squad.spawned && squad.alive > 0,
  );
}

function squadDistance(squad: SquadStateView, point: Vec2Like | null): number {
  if (!point || !squad.center) return 0;
  return distance(squad.center, point);
}

export function selectSquads(
  need: MissionNeed,
  team: TeamLike,
  rank: number,
  view: MissionStateView,
  assignments: ReadonlyMap<string, Assignment>,
  target: DirectiveTargetView,
): readonly SquadStateView[] {
  const candidates = eligibleSquads(view, team);
  const preferred = preferredSquadId(need);
  if (preferred) {
    const squad = candidates.find((candidate) => candidate.id === preferred);
    if (!squad) return [];
    const existing = assignments.get(squad.id);
    return !existing || existing.rank > rank ? [squad] : [];
  }

  const unassigned = candidates.filter((squad) => !assignments.has(squad.id));
  if (unassigned.length === 0) return [];

  const byDistance = [...unassigned].sort(
    (a, b) =>
      squadDistance(a, target.point) - squadDistance(b, target.point) ||
      compareIds(a.id, b.id),
  );

  return need.type === "eliminate" && !need.squadId
    ? byDistance
    : byDistance.slice(0, 1);
}
