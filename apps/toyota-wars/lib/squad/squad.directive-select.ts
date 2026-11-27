import type { Team } from "@toyota/combat";
import type { SquadShared } from "@/feature/squad/components/squad-vehicles";
import { SQUAD_DIRECTIVE, type SquadDirective } from "./squad.types";

/** Chooses this tick's directive from strategic input + override flags. */
export function pickDirective(params: {
  team: Team;
  shared: SquadShared | undefined;
  strategic: SquadDirective | null;
  hasMissionDirective: boolean;
}): SquadDirective {
  const { team, shared, strategic, hasMissionDirective } = params;

  if (team === "enemy") {
    return shared?.directive === SQUAD_DIRECTIVE.GENERAL_RETREAT
      ? shared.directive
      : (strategic ?? shared?.directive ?? SQUAD_DIRECTIVE.HOLD);
  }
  if (shared?.attackOrder) return SQUAD_DIRECTIVE.ADVANCE;
  if (hasMissionDirective && shared?.isExplicitOrder && shared.directive) {
    return shared.directive;
  }
  if (hasMissionDirective) return strategic ?? SQUAD_DIRECTIVE.HOLD;
  return shared?.directive ?? SQUAD_DIRECTIVE.HOLD;
}
