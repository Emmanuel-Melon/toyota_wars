"use client";

import { useCombat } from "@/context/combat-context";
import { getFormationKey } from "@/feature/game/shortcut-bindings";
import { useTutorialGates } from "@/feature/game/tutorial/tutorial-gates";
import { CommandButton } from "./command-button";

export function FormationControls({
  hideLabel = false,
}: {
  hideLabel?: boolean;
}) {
  const { allyFormation, onAllyFormationChange } = useCombat();
  const { reportFormation } = useTutorialGates();

  const run = (fn: () => void) => () => {
    fn();
    reportFormation();
  };

  return (
      <div className="flex flex-col gap-1">
        {!hideLabel && (
          <span className="font-mono text-[12px] font-semibold tracking-[0.12em] opacity-85">
            FORMATION
          </span>
        )}
        <div className="grid grid-cols-3 gap-2">

        {(["column", "wedge", "line"] as const).map((formation) => (
          <CommandButton
            key={formation}
            label={formation.slice(0, 3).toUpperCase()}
            shortcut={getFormationKey(formation)}
            active={allyFormation === formation}
            onClick={run(() => onAllyFormationChange(formation))}
          />
        ))}
      </div>
    </div>
  );
}
