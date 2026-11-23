"use client";

import { useCombat } from "@/context/combat-context";
import { useTutorialGates } from "@/feature/game/tutorial/tutorial-gates";
import { HudButton } from "@/feature/hud/components/hud-parts";

export function FormationControls() {
  const { allyFormation, onAllyFormationChange } = useCombat();
  const { reportFormation } = useTutorialGates();

  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[12px] font-semibold tracking-[0.12em] opacity-85">
        FORMATION
      </span>
      <div className="flex flex-wrap gap-2">
        {(["column", "wedge", "line"] as const).map((formation) => (
          <HudButton
            key={formation}
            active={allyFormation === formation}
            onClick={() => {
              onAllyFormationChange(formation);
              reportFormation();
            }}
          >
            {formation.slice(0, 3).toUpperCase()}
          </HudButton>
        ))}
      </div>
    </div>
  );
}
