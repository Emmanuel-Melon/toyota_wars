// packages/ai/src/director/squad-director.ts
import type {
  DirectiveFlagsView,
  MissionStateView,
  SquadDirectiveView,
} from "./mission-directive.types";
import {
  fallbackDirectives,
  freezeDirective,
  NO_TARGET,
  optionalEqual,
  pointsEqual,
} from "./director.utils";
import {
  actingTeamForNeed,
  directiveForNeed,
  targetForNeed,
} from "./need-resolver";
import {
  objectiveRank,
  orderedObjectives,
  selectSquads,
  type Assignment,
} from "./squad-assignment";

export function deriveSquadDirectives(
  view: MissionStateView,
): readonly SquadDirectiveView[] {
  if (view.status !== "active") return fallbackDirectives(view.squads);

  const assignments = new Map<string, Assignment>();
  let primaryAssigned = false;

  for (const objective of orderedObjectives(view)) {
    const rank = objectiveRank(objective);
    const actingTeam = actingTeamForNeed(objective.need, view);
    if (!actingTeam) continue;

    const target = targetForNeed(objective.need, view);
    const squads = selectSquads(
      objective.need,
      actingTeam,
      rank,
      view,
      assignments,
      target,
    );
    if (squads.length === 0) continue;

    const primary = rank === 0 && !primaryAssigned;
    if (primary) primaryAssigned = true;

    const flags: DirectiveFlagsView = {
      ...(primary ? { primary: true } : {}),
      ...(objective.need.type === "hold-zone" ||
      objective.need.type === "presence" ||
      objective.need.type === "preserve-squad"
        ? { defensive: true }
        : {}),
      ...(rank === 2 ? { temporary: true } : {}),
    };
    const directive = directiveForNeed(objective.need);

    for (const squad of squads) {
      assignments.set(squad.id, {
        directive: freezeDirective(squad.id, directive, target, flags),
        rank,
      });
    }
  }

  return Object.freeze(
    view.squads.map(
      (squad) =>
        assignments.get(squad.id)?.directive ??
        freezeDirective(squad.id, "hold", NO_TARGET, Object.freeze({})),
    ),
  );
}

export function directivesEqual(
  a: readonly SquadDirectiveView[],
  b: readonly SquadDirectiveView[],
): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i += 1) {
    const left = a[i];
    const right = b[i];
    if (
      left.squadId !== right.squadId ||
      left.directive !== right.directive ||
      left.target.kind !== right.target.kind ||
      !optionalEqual(left.target.id, right.target.id) ||
      !pointsEqual(left.target.point, right.target.point) ||
      !optionalEqual(left.target.radius, right.target.radius) ||
      !optionalEqual(left.target.stopDistance, right.target.stopDistance) ||
      !optionalEqual(left.flags.primary ?? null, right.flags.primary ?? null) ||
      !optionalEqual(
        left.flags.defensive ?? null,
        right.flags.defensive ?? null,
      ) ||
      !optionalEqual(
        left.flags.temporary ?? null,
        right.flags.temporary ?? null,
      )
    )
      return false;
  }
  return true;
}
