"use client";

import { useEffect, useState } from "react";

import { useViewport } from "@/context/viewport-context";
import type { GameState } from "@/feature/game/game.types";
import { useTutorialGates } from "@/feature/game/tutorial/tutorial-gates";
import {
  TUTORIAL_ADVANCE_DELAY_MS,
  TUTORIAL_SHOTS_REQUIRED,
  TUTORIAL_STEPS,
  TUTORIAL_STEP_COUNT,
  TUTORIAL_STEP_FIRE,
  TUTORIAL_STEP_MOVE,
} from "@/feature/game/tutorial/tutorial-steps";
import { cn } from "@/lib/utils";

import styles from "./tutorial-overlay.module.css";

export function TutorialOverlay({ game }: { game: GameState }) {
  const { tutorialStep, endTutorial } = game;
  const { shotsFired } = useTutorialGates();
  const { isMobile } = useViewport();
  const completed = tutorialStep >= TUTORIAL_STEP_COUNT;
  const step = completed ? undefined : TUTORIAL_STEPS[tutorialStep];
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [pressId, setPressId] = useState(0);

  useEffect(() => {
    if (!step) return;
    let clearPress: ReturnType<typeof setTimeout> | null = null;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      const match = step.keys.find((key) => key.matches(event));
      if (!match) return;
      setPressedKey(match.label);
      setPressId((id) => id + 1);
      if (clearPress) clearTimeout(clearPress);
      clearPress = setTimeout(
        () => setPressedKey(null),
        TUTORIAL_ADVANCE_DELAY_MS,
      );
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (clearPress) clearTimeout(clearPress);
    };
  }, [step]);

  useEffect(() => {
    if (!completed) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" || event.repeat) return;
      endTutorial();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [completed, endTutorial]);

  const hint = completed
    ? isMobile
      ? "TAP CONTINUE TO PROCEED"
      : "PRESS ENTER TO CONTINUE"
    : tutorialStep === TUTORIAL_STEP_FIRE
      ? `SHOTS FIRED ${shotsFired}/${TUTORIAL_SHOTS_REQUIRED}`
      : tutorialStep === TUTORIAL_STEP_MOVE
        ? "DRIVE FORWARD TO UNLOCK FIRING"
        : "PERFORM THE ACTION TO UNLOCK THE NEXT STEP";

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[8]"
      role="region"
      aria-label="Tutorial"
    >
      {step && isMobile ? (
        <div
          className="absolute left-1/2 top-[58%] w-[calc(100vw-48px)] -translate-x-1/2 text-center font-mono text-[12px] font-bold uppercase leading-[1.5] tracking-[0.14em] text-ui-text/80"
          aria-hidden="true"
        >
          Use the on-screen controls
        </div>
      ) : step ? (
        <div
          className="absolute left-1/2 top-1/2 flex w-[min(420px,calc(100vw-48px))] -translate-x-1/2 -translate-y-1/2 flex-wrap justify-center gap-[14px]"
          aria-hidden="true"
        >
          {step.keys.map((key) => {
            const pressed = pressedKey === key.label;
            return (
              <kbd
                key={`${key.label}-${pressed ? pressId : "idle"}`}
                className={cn(
                  styles.key,
                  "grid min-h-16 min-w-16 place-items-center rounded-[10px] border-2 border-ui-secondary/55 bg-ui-panel/90 p-[10px_14px] font-mono text-[28px] font-bold leading-none text-ui-text shadow-[0_6px_0_rgb(var(--ui-panel-rgb)/0.7),0_18px_40px_rgb(var(--ui-panel-rgb)/0.45)] max-[919px]:min-h-[52px] max-[919px]:min-w-[52px] max-[919px]:text-[22px]",
                  pressed &&
                    cn(
                      styles.pressed,
                      "border-ui-primary bg-ui-primary text-ui-panel shadow-[0_4px_0_rgb(var(--ui-panel-rgb)/0.7),0_0_36px_rgb(var(--ui-primary-rgb)/0.5)]",
                    ),
                )}
              >
                {key.label}
              </kbd>
            );
          })}
        </div>
      ) : null}

      <div
        className={cn(
          styles.panel,
          "absolute left-1/2 top-8 w-[min(420px,calc(100vw-48px))] -translate-x-1/2 rounded-md border border-ui-secondary/30 px-4 pb-3 pt-[14px] text-center text-ui-text shadow-[0_18px_48px_rgb(var(--ui-panel-rgb)/0.5)] max-[919px]:top-4 max-[919px]:w-[calc(100vw-32px)]",
        )}
      >
        <span className="font-mono text-[10px] font-semibold leading-[1.4] tracking-[0.16em] text-ui-primary uppercase">
          {completed
            ? "TRAINING COMPLETE"
            : `STEP ${tutorialStep + 1} / ${TUTORIAL_STEP_COUNT}`}
        </span>
        <div className="mt-2 font-mono text-[18px] font-bold leading-[1.3] tracking-[0.06em] uppercase">
          {completed ? "Ready for battle" : step?.title}
        </div>
        <p className="mt-[5px] font-mono text-[12px] leading-[1.5] text-ui-text/80">
          {completed
            ? "You know how to drive, fire, and command your allies."
            : step?.detail}
        </p>
        <div className="mt-[9px] font-mono text-[10px] font-semibold leading-[1.4] tracking-[0.12em] text-ui-primary/95 uppercase">
          {hint}
        </div>
        <div className="mt-3 flex gap-1.5" aria-hidden="true">
          {TUTORIAL_STEPS.map((item, index) => (
            <span
              key={item.id}
              className={cn(
                "h-[3px] flex-1 bg-ui-secondary/25",
                index <= tutorialStep && "bg-ui-primary",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
