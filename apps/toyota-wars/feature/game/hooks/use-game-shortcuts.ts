"use client";

import { useEffect, type Dispatch, type SetStateAction } from "react";
import type {
  SquadDirective,
  FireDesignationGroup,
} from "@/lib/squad/squad.types";
import type { FormationType } from "@/lib/tactics/tactics.formation";
import type { GameMode } from "../game.types";
import {
  ATTACK_KEY,
  CLEAR_DESIGNATION_KEY,
  DESIGNATION_KEYS,
  DIRECTIVE_KEYS,
  FORMATION_KEYS,
  resolveEscape,
} from "../shortcut-bindings";

type Params = {
  disabled: boolean;
  hasActiveRound: boolean;
  canCommand: boolean;
  canFormation: boolean;
  onModeChange: Dispatch<SetStateAction<GameMode>>;
  onAttack: () => void;
  onDirective: (directive: SquadDirective) => void;
  onFormation: (formation: FormationType) => void;
  onDesignateFire: (group: FireDesignationGroup) => void;
  onClearDesignation: () => void;
};

/**
 * Global keyboard shortcuts for the game shell. The key→action mapping lives
 * in `shortcut-bindings.ts` so adding a new binding is one line, not another
 * `else if`.
 */
export function useGameShortcuts({
  disabled,
  hasActiveRound,
  canCommand,
  canFormation,
  onModeChange,
  onAttack,
  onDirective,
  onFormation,
  onDesignateFire,
  onClearDesignation,
}: Params): void {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (disabled) return;
      const key = event.key.toLowerCase();

      if (key === "escape") {
        onModeChange((current) => resolveEscape(current, hasActiveRound));
        return;
      }

      if (key === ATTACK_KEY) {
        if (canCommand) onAttack();
        return;
      }

      const directive = DIRECTIVE_KEYS[key];
      if (directive) {
        if (canCommand) onDirective(directive);
        return;
      }

      const formation = FORMATION_KEYS[key];
      if (formation) {
        if (canFormation) onFormation(formation);
        return;
      }

      const group = DESIGNATION_KEYS[key];
      if (group) {
        if (canCommand) onDesignateFire(group);
        return;
      }

      if (key === CLEAR_DESIGNATION_KEY && canCommand) onClearDesignation();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    disabled,
    hasActiveRound,
    canCommand,
    canFormation,
    onModeChange,
    onAttack,
    onDirective,
    onFormation,
    onDesignateFire,
    onClearDesignation,
  ]);
}
