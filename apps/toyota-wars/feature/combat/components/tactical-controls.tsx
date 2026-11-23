"use client";

import { useCombat } from "@/context/combat-context";
import { usePlayer } from "@/context/player-context";
import { useTutorialGates } from "@/feature/game/tutorial/tutorial-gates";
import { HudButton } from "@/feature/hud/components/hud-parts";
import {
  ALLY_ATTACK_MODE,
  FIRE_DESIGNATION_GROUP,
  SQUAD_DIRECTIVE,
} from "@/lib/squad/squad.types";

export function TacticalControls() {
  const {
    allyDirective,
    onAllyDirectiveChange,
    attackOrder,
    issueAllyAttack,
    fireDesignation,
    clearFireDesignation,
  } = useCombat();
  const { designateFireFromAim, getCurrentTargetId } = usePlayer();
  const { reportCommand } = useTutorialGates();

  return (
    <>
      <div className="flex flex-row items-center gap-2">
        <span className="w-24 shrink-0 whitespace-nowrap font-mono text-[12px] font-semibold tracking-[0.12em] opacity-85">
          ALLY ORDERS
        </span>
        <div className="flex flex-1 flex-wrap gap-2">
          <HudButton
            active={Boolean(attackOrder)}
            onClick={() => {
              issueAllyAttack(
                fireDesignation?.targetId ?? getCurrentTargetId() ?? undefined,
              );
              reportCommand();
            }}
          >
            {attackOrder?.mode === ALLY_ATTACK_MODE.FOCUS
              ? "FOCUS ATTACK"
              : attackOrder?.mode === ALLY_ATTACK_MODE.SEEK
                ? "SEEK ATTACK"
                : "ATTACK"}
          </HudButton>
          <HudButton
            active={allyDirective === SQUAD_DIRECTIVE.HOLD}
            onClick={() => {
              onAllyDirectiveChange(SQUAD_DIRECTIVE.HOLD);
              reportCommand();
            }}
          >
            FOLLOW
          </HudButton>
          <HudButton
            active={allyDirective === SQUAD_DIRECTIVE.GENERAL_RETREAT}
            onClick={() => {
              onAllyDirectiveChange(SQUAD_DIRECTIVE.GENERAL_RETREAT);
              reportCommand();
            }}
          >
            FLEE
          </HudButton>
        </div>
      </div>
      <div className="flex flex-row items-center gap-2">
        <span className="w-24 shrink-0 whitespace-nowrap font-mono text-[12px] font-semibold tracking-[0.12em] opacity-85">
          FIRE
        </span>
        <div className="flex flex-1 flex-wrap gap-2">
          <HudButton
            active={fireDesignation?.group === FIRE_DESIGNATION_GROUP.NEARBY}
            onClick={() => {
              designateFireFromAim(FIRE_DESIGNATION_GROUP.NEARBY);
              reportCommand();
            }}
          >
            NEARBY
          </HudButton>
          <HudButton
            active={fireDesignation?.group === FIRE_DESIGNATION_GROUP.TYPE63}
            onClick={() => {
              designateFireFromAim(FIRE_DESIGNATION_GROUP.TYPE63);
              reportCommand();
            }}
          >
            TYPE63
          </HudButton>
          <HudButton
            active={fireDesignation?.group === FIRE_DESIGNATION_GROUP.ZU23}
            onClick={() => {
              designateFireFromAim(FIRE_DESIGNATION_GROUP.ZU23);
              reportCommand();
            }}
          >
            ZU23
          </HudButton>
          <HudButton
            onClick={() => {
              clearFireDesignation();
              reportCommand();
            }}
            disabled={!fireDesignation}
          >
            CLEAR
          </HudButton>
        </div>
      </div>
    </>
  );
}
