import type { Team } from "./combat.types";

export const opposingTeam = (team: Team): Team =>
  team === "ally" ? "enemy" : "ally";

// lib/combat/combat.teams.ts
export type VehiclePart =
  | "body"
  | "hood"
  | "turret"
  | "wheelFL"
  | "wheelFR"
  | "wheelRL"
  | "wheelRR"
  | "doorFL"
  | "doorFR"
  | "doorRL"
  | "doorRR"
  | "windshield"
  | "windowFL"
  | "windowFR"
  | "windowRL"
  | "windowRR"
  | "windowRear";

export function partId(unitId: string, part: VehiclePart): string {
  return `${unitId}:${part}`;
}
