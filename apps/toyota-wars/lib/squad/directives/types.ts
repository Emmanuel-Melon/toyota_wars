import type { FormationType } from "@/lib/tactics/tactics.formation";
import type { SquadMemberTelemetry, TacticalRole } from "../squad.types";

export type SubGroupAssignment = {
  role: TacticalRole;
  formationType: FormationType;
  formationOffset: [number, number];
  subGroupLeaderId: string | null;
  useOrbitTactic: boolean;
};

export type DirectiveAssignments = Map<string, SubGroupAssignment>;

/** Input every strategy receives — pre-partitioned so strategies stay tiny. */
export type DirectiveContext = {
  members: SquadMemberTelemetry[];
  artillery: SquadMemberTelemetry[];
  heavyDirect: SquadMemberTelemetry[];
  skirmishers: SquadMemberTelemetry[];
  /** ZU-23 + DShK, sorted by mobility descending. */
  directCombatants: SquadMemberTelemetry[];
  spacing: number;
};

export interface DirectiveStrategy {
  assign(ctx: DirectiveContext): DirectiveAssignments;
}
