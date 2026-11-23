import {
  getFormationOffset,
  type FormationType,
} from "@/lib/tactics/tactics.formation";
import type { SquadMemberTelemetry, TacticalRole } from "../squad.types";
import type { DirectiveAssignments, DirectiveContext } from "./types";

export function partitionByWeapon(members: SquadMemberTelemetry[]) {
  const artillery = members.filter((m) => m.weapon.id === "type63");
  const heavyDirect = members.filter((m) => m.weapon.id === "zu23");
  const skirmishers = members.filter((m) => m.weapon.id === "dshk");
  const directCombatants = [...heavyDirect, ...skirmishers].sort(
    (a, b) => b.vehicle.mobility - a.vehicle.mobility,
  );
  return { artillery, heavyDirect, skirmishers, directCombatants };
}

export function buildDirectiveContext(
  members: SquadMemberTelemetry[],
  spacing: number,
): DirectiveContext {
  return { members, spacing, ...partitionByWeapon(members) };
}

/** Assign a contiguous group to a formation, picking the head as sub-leader. */
export function assignGroup(
  out: DirectiveAssignments,
  group: SquadMemberTelemetry[],
  roleForIndex: (i: number) => TacticalRole,
  formationType: FormationType,
  spacing: number,
  useOrbitTactic = false,
): void {
  const headId = group[0]?.id ?? null;
  group.forEach((member, idx) => {
    out.set(member.id, {
      role: roleForIndex(idx),
      formationType,
      formationOffset: getFormationOffset(idx, formationType, spacing),
      subGroupLeaderId: idx === 0 ? null : headId,
      useOrbitTactic,
    });
  });
}

/** Rocket units always sit deep in the rear — shared by every directive. */
export function assignArtilleryRear(
  ctx: DirectiveContext,
  out: DirectiveAssignments,
): void {
  ctx.artillery.forEach((art, idx) => {
    out.set(art.id, {
      role: "artillery_support",
      formationType: "line",
      formationOffset: [0, -25 - idx * ctx.spacing],
      subGroupLeaderId: ctx.directCombatants[0]?.id ?? null,
      useOrbitTactic: false,
    });
  });
}
