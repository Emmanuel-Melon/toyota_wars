// packages/ai/src/director/need-resolver.ts
import type {
  DirectiveTargetView,
  MissionNeed,
  MissionStateView,
  SquadDirectiveType,
} from "./mission-directive.types";
import {
  copyPoint,
  NO_TARGET,
  oppositeTeam,
  squadById,
  type TeamLike,
} from "./director.utils";

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

export function targetForNeed(
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

export function actingTeamForNeed(
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

export function preferredSquadId(need: MissionNeed): string | null {
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

export function directiveForNeed(need: MissionNeed): SquadDirectiveType {
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
