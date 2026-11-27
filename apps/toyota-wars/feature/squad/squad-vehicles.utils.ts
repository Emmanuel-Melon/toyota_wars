import type { Team } from "@toyota/combat";
import type { RosterSquad, RosterUnit } from "@/lib/squad/squad.roster";

export const EMPTY_UNITS: readonly RosterUnit[] = [];

export function filterSquadsByTeam(
  squads: readonly RosterSquad[],
  team: Team,
): RosterSquad[] {
  return squads.filter((squad) => squad.team === team);
}

export function groupTankUnitsBySquad(
  units: readonly RosterUnit[],
): Map<string, RosterUnit[]> {
  const bySquad = new Map<string, RosterUnit[]>();
  for (const unit of units) {
    if (unit.kind !== "tank") continue;
    const list = bySquad.get(unit.squadId) ?? [];
    list.push(unit);
    bySquad.set(unit.squadId, list);
  }
  return bySquad;
}
