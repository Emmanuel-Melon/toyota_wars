// packages/ai/src/director/director.utils.ts
import type {
  DirectiveFlagsView,
  DirectiveTargetView,
  MissionStateView,
  SquadDirectiveType,
  SquadDirectiveView,
  SquadStateView,
} from "./mission-directive.types";

export type Vec2Like = NonNullable<DirectiveTargetView["point"]>;
export type TeamLike = SquadStateView["team"];

export const NO_TARGET: DirectiveTargetView = Object.freeze({
  kind: "none",
  point: null,
});

export function oppositeTeam(team: TeamLike): TeamLike {
  return team === "ally" ? "enemy" : "ally";
}

export function compareIds(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export function distance(a: Vec2Like, b: Vec2Like): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

export function copyPoint(point: Vec2Like): Vec2Like {
  return Object.freeze({ x: point.x, z: point.z });
}

export function pointsEqual(a: Vec2Like | null, b: Vec2Like | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.x === b.x && a.z === b.z;
}

export function optionalEqual(a: unknown, b: unknown): boolean {
  return (a ?? null) === (b ?? null);
}

export function squadById(
  view: MissionStateView,
  squadId: string,
): SquadStateView | undefined {
  return view.squads.find((squad) => squad.id === squadId);
}

export function freezeDirective(
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

export function fallbackDirectives(
  squads: readonly SquadStateView[],
): readonly SquadDirectiveView[] {
  return Object.freeze(
    squads.map((squad) =>
      freezeDirective(squad.id, "hold", NO_TARGET, Object.freeze({})),
    ),
  );
}
