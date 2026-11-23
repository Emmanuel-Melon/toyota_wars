"use client";

import { useState } from "react";
import { FormationControls } from "@/feature/combat/components/formation-controls";
import { TacticalControls } from "@/feature/combat/components/tactical-controls";
import { AimCameraControls } from "@/feature/controls/components/aim-camera-controls";
import { TUTORIAL_STEP_COUNT } from "@/feature/game/tutorial/tutorial-steps";
import type { GameState } from "@/feature/game/game.types";
import styles from "./tactical-drawer.module.css";

export function TacticalDrawer({ game }: { game: GameState }) {
  const [open, setOpen] = useState(false);
  const showContinue =
    game.tutorialActive && game.tutorialStep >= TUTORIAL_STEP_COUNT;

  return (
    <>
      <div className={styles.topCluster}>
        <button
          type="button"
          className={styles.trigger}
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          Orders
        </button>
        {showContinue && (
          <button
            type="button"
            className={styles.trigger}
            onClick={game.endTutorial}
          >
            Continue
          </button>
        )}
        <button
          type="button"
          className={styles.trigger}
          onClick={() => game.setMode("menu")}
        >
          Menu
        </button>
      </div>

      {open && (
        <div className={styles.sheet} role="dialog" aria-label="Tactical menu">
          <div className={styles.sheetHeader}>
            <span>TACTICAL MENU</span>
            <button
              type="button"
              className={styles.close}
              onClick={() => setOpen(false)}
              aria-label="Close tactical menu"
            >
              ×
            </button>
          </div>
          <div className={styles.sheetBody}>
            <AimCameraControls />
            <FormationControls />
            <TacticalControls />
          </div>
        </div>
      )}
    </>
  );
}
