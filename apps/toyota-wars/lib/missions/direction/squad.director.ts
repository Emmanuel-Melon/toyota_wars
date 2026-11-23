import type {
  DirectiveFlagsView,
  DirectiveTargetView,
  MissionNeed,
  MissionStateView,
  ObjectiveStateView,
  SquadDirectiveType,
  SquadDirectiveView,
  SquadStateView,
} from "./mission-view.types";

type Vec2Like = NonNullable<DirectiveTargetView["point"]>;
type TeamLike = SquadStateView["team"];

type Assignment = {
  directive: SquadDirectiveView;
  rank: number;
};

const NO_TARGET: DirectiveTargetView = Object.freeze({
  kind: "none",
  point: null,
});

function oppositeTeam(team: TeamLike): TeamLike {
  return team === "ally" ? "enemy" : "ally";
}

function compareIds(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function distance(a: Vec2Like, b: Vec2Like): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function copyPoint(point: Vec2Like): Vec2Like {
  return Object.freeze({ x: point.x, z: point.z });
}

function squadById(
  view: MissionStateView,
  squadId: string,
): SquadStateView | undefined {
  return view.squads.find((squad) => squad.id === squadId);
}

function zoneTarget(
  view: MissionStateView,
  zoneId: string,
  authoredStopDistance?: number,
): DirectiveTargetView | null {
  const zone = view.zones.find((candidate) => candidate.id === zoneId);
  if (!zone) return null;
  const point = copyPoint(zone.position);
  return Object.freeze({
    kind: "zone",
    id: zone.id,
    point,
    radius: zone.radius,
    stopDistance:
      authoredStopDistance ?? Math.max(2, Math.min(zone.radius * 0.5, 10)),
  });
}

function routeTarget(
  view: MissionStateView,
  squadId: string,
): DirectiveTargetView | null {
  const route = view.routes.find((candidate) => candidate.squadId === squadId);
  if (!route) return null;
  const point = copyPoint(
    route.arrivedAt == null ? route.currentPoint : route.destination,
  );
  return Object.freeze({
    kind: "route",
    id: route.squadId,
    point,
    radius: route.radius,
    stopDistance: route.radius,
  });
}

function squadTarget(
  view: MissionStateView,
  squadId: string,
): DirectiveTargetView | null {
  const squad = squadById(view, squadId);
  if (!squad?.center) return null;
  return Object.freeze({
    kind: "squad",
    id: squad.id,
    point: copyPoint(squad.center),
    radius: 8,
    stopDistance: 6,
  });
}

function targetForNeed(
  need: MissionNeed,
  view: MissionStateView,
): DirectiveTargetView {
  switch (need.type) {
    case "eliminate":
      return need.squadId
        ? (squadTarget(view, need.squadId) ?? NO_TARGET)
        : NO_TARGET;
    case "control-zone":
    case "hold-zone":
    case "occupy-zone":
    case "presence":
      return zoneTarget(view, need.zoneId, need.stopDistance) ?? NO_TARGET;
    case "reach-route":
    case "deny-route":
      return routeTarget(view, need.squadId) ?? NO_TARGET;
    case "preserve-squad":
      return squadTarget(view, need.squadId) ?? NO_TARGET;
    case "survive":
      return NO_TARGET;
  }
}

function actingTeamForNeed(
  need: MissionNeed,
  view: MissionStateView,
): TeamLike | null {
  switch (need.type) {
    case "eliminate":
      return oppositeTeam(need.team);
    case "control-zone":
    case "hold-zone":
      return need.team;
    case "occupy-zone":
    case "presence":
    case "preserve-squad":
    case "reach-route":
      return squadById(view, need.squadId)?.team ?? null;
    case "deny-route": {
      const squad = squadById(view, need.squadId);
      return squad ? oppositeTeam(squad.team) : null;
    }
    case "survive":
      return "ally";
  }
}

function preferredSquadId(need: MissionNeed): string | null {
  switch (need.type) {
    case "occupy-zone":
    case "presence":
    case "preserve-squad":
    case "reach-route":
      return need.squadId;
    default:
      return null;
  }
}

function directiveForNeed(need: MissionNeed): SquadDirectiveType {
  switch (need.type) {
    case "eliminate":
      return "engage";
    case "control-zone":
    case "occupy-zone":
    case "reach-route":
      return "advance";
    case "hold-zone":
      return "defend";
    case "presence":
    case "preserve-squad":
      return "escort";
    case "deny-route":
      return "intercept";
    case "survive":
      return "hold";
  }
}

function objectiveRank(objective: ObjectiveStateView): number {
  if (objective.kind !== "goal") return 2;
  return objective.required ? 0 : 1;
}

function orderedObjectives(
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

function selectSquads(
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

function freezeDirective(
  squadId: string,
  directive: SquadDirectiveType,
  target: DirectiveTargetView,
  flags: DirectiveFlagsView,
): SquadDirectiveView {
  const point = target.point ? copyPoint(target.point) : null;
  return Object.freeze({
    squadId,
    directive,
    target: Object.freeze({
      kind: target.kind,
      ...(target.id === undefined ? {} : { id: target.id }),
      point,
      ...(target.radius === undefined ? {} : { radius: target.radius }),
      ...(target.stopDistance === undefined
        ? {}
        : { stopDistance: target.stopDistance }),
    }),
    flags: Object.freeze({ ...flags }),
  });
}

function fallbackDirectives(
  squads: readonly SquadStateView[],
): readonly SquadDirectiveView[] {
  return Object.freeze(
    squads.map((squad) =>
      freezeDirective(squad.id, "hold", NO_TARGET, Object.freeze({})),
    ),
  );
}

function pointsEqual(a: Vec2Like | null, b: Vec2Like | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.x === b.x && a.z === b.z;
}

function optionalEqual(a: unknown, b: unknown): boolean {
  return (a ?? null) === (b ?? null);
}

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
