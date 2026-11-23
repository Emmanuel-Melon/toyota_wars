"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { usePlayer } from "@/context/player-context";
import type { GameState } from "@/feature/game/game.types";
import { useTutorialGates } from "@/feature/game/tutorial/tutorial-gates";
import { TUTORIAL_STEP_COUNT } from "@/feature/game/tutorial/tutorial-steps";
import { clampAim } from "@/lib/aim/aim.state";
import styles from "./touch-controls.module.css";

const STICK_RADIUS = 40;
const AIM_SENSITIVITY = 3;

export function TouchControls({ game }: { game: GameState }) {
  const { playerCommand, aimRef, aimMode, firingRef, paused, destroyed } =
    usePlayer();
  const { capabilities, reportForward } = useTutorialGates();

  const driveRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const drivePointer = useRef<number | null>(null);
  const aimPointer = useRef<number | null>(null);
  const aimDrag = useRef({ x: 0, y: 0, aimX: 0, aimY: 0 });

  const resetDrive = useCallback(() => {
    if (knobRef.current)
      knobRef.current.style.transform = "translate(-50%, -50%)";
    playerCommand.current.throttle = 0;
    playerCommand.current.steer = 0;
    playerCommand.current.desiredHeading = null;
  }, [playerCommand]);

  useEffect(() => {
    if (!paused && !destroyed) return;
    firingRef.current = false;
    drivePointer.current = null;
    aimPointer.current = null;
    resetDrive();
  }, [paused, destroyed, firingRef, resetDrive]);

  useEffect(
    () => () => {
      firingRef.current = false;
      resetDrive();
    },
    [firingRef, resetDrive],
  );

  useEffect(() => {
    if (aimMode !== "manual") aimPointer.current = null;
  }, [aimMode]);

  const updateDrive = (clientX: number, clientY: number) => {
    const rect = driveRef.current?.getBoundingClientRect();
    if (!rect) return;

    const rawX = clientX - (rect.left + rect.width / 2);
    const rawY = clientY - (rect.top + rect.height / 2);
    const length = Math.hypot(rawX, rawY);
    const scale = length > STICK_RADIUS ? STICK_RADIUS / length : 1;
    const x = rawX * scale;
    const y = rawY * scale;

    if (knobRef.current) {
      knobRef.current.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    }
    if (paused || destroyed) return;

    const throttle = -y / STICK_RADIUS;
    playerCommand.current.throttle = capabilities.forwardOnly
      ? Math.max(0, throttle)
      : throttle;
    playerCommand.current.steer = capabilities.forwardOnly
      ? 0
      : x / STICK_RADIUS;
    playerCommand.current.desiredHeading = null;
    if (playerCommand.current.throttle > 0.1) reportForward();
  };

  const handleDriveDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drivePointer.current = event.pointerId;
    updateDrive(event.clientX, event.clientY);
  };

  const handleDriveMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (drivePointer.current !== event.pointerId) return;
    updateDrive(event.clientX, event.clientY);
  };

  const handleDriveUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (drivePointer.current !== event.pointerId) return;
    drivePointer.current = null;
    resetDrive();
  };

  const handleAimDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" || aimMode !== "manual") return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    aimPointer.current = event.pointerId;
    aimDrag.current = {
      x: event.clientX,
      y: event.clientY,
      aimX: aimRef.current.x,
      aimY: aimRef.current.y,
    };
  };

  const handleAimMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (aimPointer.current !== event.pointerId) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = (event.clientX - aimDrag.current.x) / rect.width;
    const dy = (event.clientY - aimDrag.current.y) / rect.height;
    aimRef.current = clampAim({
      x: aimDrag.current.aimX + dx * AIM_SENSITIVITY,
      y: aimDrag.current.aimY - dy * AIM_SENSITIVITY,
    });
  };

  const handleAimUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (aimPointer.current === event.pointerId) aimPointer.current = null;
  };

  const startFire = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    firingRef.current = true;
  };

  const showContinue =
    game.tutorialActive && game.tutorialStep >= TUTORIAL_STEP_COUNT;

  return (
    <>
      <div
        className={styles.aimCatcher}
        data-camera-look-surface=""
        onPointerDown={handleAimDown}
        onPointerMove={handleAimMove}
        onPointerUp={handleAimUp}
        onPointerCancel={handleAimUp}
        onContextMenu={(event) => event.preventDefault()}
        aria-hidden="true"
      />

      <div className={styles.controlLayer}>
        <div
          ref={driveRef}
          className={styles.drive}
          onPointerDown={handleDriveDown}
          onPointerMove={handleDriveMove}
          onPointerUp={handleDriveUp}
          onPointerCancel={handleDriveUp}
          onContextMenu={(event) => event.preventDefault()}
          role="group"
          aria-label="Touch driving stick"
        >
          <div
            ref={knobRef}
            style={{ transform: "translate(-50%, -50%)" }}
            className={styles.knob}
          />
          <span className={styles.driveLabel}>DRIVE</span>
        </div>

        <div className={styles.actionCluster}>
          {showContinue && (
            <button
              type="button"
              className={styles.textButton}
              onClick={game.endTutorial}
            >
              Continue
            </button>
          )}
          <button
            type="button"
            className={styles.fire}
            onPointerDown={startFire}
            onPointerUp={() => {
              firingRef.current = false;
            }}
            onPointerCancel={() => {
              firingRef.current = false;
            }}
            onContextMenu={(event) => event.preventDefault()}
            aria-label="Fire weapon"
          >
            Fire
          </button>
        </div>
      </div>
    </>
  );
}
