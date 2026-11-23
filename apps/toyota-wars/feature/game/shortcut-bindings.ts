import {
  SQUAD_DIRECTIVE,
  FIRE_DESIGNATION_GROUP,
} from "@/lib/squad/squad.types";
import type { FormationType } from "@/lib/tactics/tactics.formation";
import type {
  SquadDirective,
  FireDesignationGroup,
} from "@/lib/squad/squad.types";
import type { GameMode } from "./game.types";

export const ATTACK_KEY = "z";

export const DIRECTIVE_KEYS: Record<string, SquadDirective> = {
  x: SQUAD_DIRECTIVE.HOLD,
  c: SQUAD_DIRECTIVE.GENERAL_RETREAT,
};

export const FORMATION_KEYS: Record<string, FormationType> = {
  "1": "column",
  "2": "wedge",
  "3": "line",
};

export const DESIGNATION_KEYS: Record<string, FireDesignationGroup> = {
  f: FIRE_DESIGNATION_GROUP.NEARBY,
  g: FIRE_DESIGNATION_GROUP.TYPE63,
  t: FIRE_DESIGNATION_GROUP.ZU23,
};

export const CLEAR_DESIGNATION_KEY = "r";

/** Escape-back-stack — pure so it can be tested without a keyboard. */
export function resolveEscape(
  current: GameMode,
  hasActiveRound: boolean,
): GameMode {
  if (current === "playing" || current === "settings") return "menu";
  if (current === "new-game") return "menu";
  if (current === "survival") return "new-game";
  if (current === "mission-select") return "menu";
  if (current === "vehicle-select") return "mission-select";
  return hasActiveRound ? "playing" : "menu";
}
