"use client";

import { Crosshair, Footprints, Radar, Undo2, X } from "lucide-react";
import { useCombat } from "@/context/combat-context";
import { usePlayer } from "@/context/player-context";
import {
  ATTACK_KEY,
  CLEAR_DESIGNATION_KEY,
  getDesignationKey,
  getDirectiveKey,
} from "@/feature/game/shortcut-bindings";
import { useTutorialGates } from "@/feature/game/tutorial/tutorial-gates";
import {
  ALLY_ATTACK_MODE,
  FIRE_DESIGNATION_GROUP,
  SQUAD_DIRECTIVE,
} from "@/lib/squad/squad.types";
import { CommandButton } from "./command-button";

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

  const run = (fn: () => void) => () => {
    fn();
    reportCommand();
  };

  const attackLabel =
    attackOrder?.mode === ALLY_ATTACK_MODE.FOCUS
      ? "FOCUS"
      : attackOrder?.mode === ALLY_ATTACK_MODE.SEEK
        ? "SEEK"
        : "ATTACK";

  return (
    <>
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[12px] font-semibold tracking-[0.12em] opacity-85">
          ALLY ORDERS
        </span>
        <div className="grid grid-cols-3 gap-2">
          <CommandButton
            icon={<Crosshair size={14} />}
            label={attackLabel}
            shortcut={ATTACK_KEY}
            active={Boolean(attackOrder)}
            onClick={run(() =>
              issueAllyAttack(
                fireDesignation?.targetId ?? getCurrentTargetId() ?? undefined,
              ),
            )}
          />
          <CommandButton
            icon={<Footprints size={14} />}
            label="FOLLOW"
            shortcut={getDirectiveKey(SQUAD_DIRECTIVE.HOLD)}
            active={allyDirective === SQUAD_DIRECTIVE.HOLD}
            onClick={run(() =>
              onAllyDirectiveChange(SQUAD_DIRECTIVE.HOLD),
            )}
          />
          <CommandButton
            icon={<Undo2 size={14} />}
            label="FLEE"
            shortcut={getDirectiveKey(SQUAD_DIRECTIVE.GENERAL_RETREAT)}
            active={allyDirective === SQUAD_DIRECTIVE.GENERAL_RETREAT}
            onClick={run(() =>
              onAllyDirectiveChange(SQUAD_DIRECTIVE.GENERAL_RETREAT),
            )}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="font-mono text-[12px] font-semibold tracking-[0.12em] opacity-85">
          FIRE
        </span>
        <div className="grid grid-cols-2 gap-2">
          <CommandButton
            icon={<Radar size={14} />}
            label="NEARBY"
            shortcut={getDesignationKey(FIRE_DESIGNATION_GROUP.NEARBY)}
            active={fireDesignation?.group === FIRE_DESIGNATION_GROUP.NEARBY}
            onClick={run(() =>
              designateFireFromAim(FIRE_DESIGNATION_GROUP.NEARBY),
            )}
          />
          <CommandButton
            label="TYPE63"
            shortcut={getDesignationKey(FIRE_DESIGNATION_GROUP.TYPE63)}
            active={fireDesignation?.group === FIRE_DESIGNATION_GROUP.TYPE63}
            onClick={run(() =>
              designateFireFromAim(FIRE_DESIGNATION_GROUP.TYPE63),
            )}
          />
          <CommandButton
            label="ZU23"
            shortcut={getDesignationKey(FIRE_DESIGNATION_GROUP.ZU23)}
            active={fireDesignation?.group === FIRE_DESIGNATION_GROUP.ZU23}
            onClick={run(() =>
              designateFireFromAim(FIRE_DESIGNATION_GROUP.ZU23),
            )}
          />
          <CommandButton
            icon={<X size={14} />}
            label="CLEAR"
            shortcut={CLEAR_DESIGNATION_KEY}
            disabled={!fireDesignation}
            onClick={run(clearFireDesignation)}
          />
        </div>
      </div>
    </>
  );
}
