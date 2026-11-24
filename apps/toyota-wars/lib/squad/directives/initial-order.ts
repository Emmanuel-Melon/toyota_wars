import { SQUAD_DIRECTIVE, type SquadDirective } from "../squad.types";
import type { InitialOrder } from "@toyota/missions";

/** Default directive for a fresh squad with no explicit player order. */
export function directiveForInitialOrder(order: InitialOrder): SquadDirective {
  switch (order) {
    case "attack":
      return SQUAD_DIRECTIVE.ADVANCE;
    case "flee":
      return SQUAD_DIRECTIVE.GENERAL_RETREAT;
    case "follow":
    case "patrol":
    default:
      return SQUAD_DIRECTIVE.HOLD;
  }
}
