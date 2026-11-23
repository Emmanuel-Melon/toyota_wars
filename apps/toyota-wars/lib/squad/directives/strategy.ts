import { SQUAD_DIRECTIVE, type SquadDirective } from "@/lib/squad/squad.types";
import { advanceDirective } from "@/lib/squad/directives/advance";
import { holdDirective } from "@/lib/squad/directives/hold";
import { flankDirective } from "@/lib/squad/directives/flank";
import { fightingRetreatDirective } from "@/lib/squad/directives/fighting-retreat";
import { generalRetreatDirective } from "@/lib/squad/directives/general-retreat";
import type { DirectiveStrategy } from "@/lib/squad/directives/types";

const STRATEGIES: Record<SquadDirective, DirectiveStrategy> = {
  [SQUAD_DIRECTIVE.ADVANCE]: advanceDirective,
  [SQUAD_DIRECTIVE.HOLD]: holdDirective,
  [SQUAD_DIRECTIVE.FLANK]: flankDirective,
  [SQUAD_DIRECTIVE.FIGHTING_RETREAT]: fightingRetreatDirective,
  [SQUAD_DIRECTIVE.GENERAL_RETREAT]: generalRetreatDirective,
};

export function getDirectiveStrategy(
  directive: SquadDirective,
): DirectiveStrategy {
  return STRATEGIES[directive] ?? holdDirective;
}
