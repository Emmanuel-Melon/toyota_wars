"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useDroneRoam } from "../drone-roam.context";
import styles from "./drone-roam-touch-controls.module.css";

const STICK_RADIUS = 34;

export function DroneRoamTouchControls() {
  const { input } = useDroneRoam();
  const stickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const stickPointer = useRef<number | null>(null);
  const liftPointer = useRef<number | null>(null);

  const resetStick = useCallback(() => {
    if (knobRef.current)
      knobRef.current.style.transform = "translate(-50%, -50%)";
    stickPointer.current = null;
    input.forward = 0;
    input.strafe = 0;
  }, [input]);

  const resetLift = useCallback(() => {
    liftPointer.current = null;
    input.lift = 0;
  }, [input]);

  const updateStick = (clientX: number, clientY: number) => {
    const rect = stickRef.current?.getBoundingClientRect();
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
    input.strafe = x / STICK_RADIUS;
    input.forward = -y / STICK_RADIUS;
  };

  const handleStickDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    stickPointer.current = event.pointerId;
    updateStick(event.clientX, event.clientY);
  };

  const handleStickMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (stickPointer.current !== event.pointerId) return;
    updateStick(event.clientX, event.clientY);
  };

  const handleStickUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (stickPointer.current !== event.pointerId) return;
    resetStick();
  };

  const startLift =
    (direction: number) => (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      liftPointer.current = event.pointerId;
      input.lift = direction;
    };

  const stopLift = (pointerId?: number) => {
    if (pointerId !== undefined && liftPointer.current !== pointerId) return;
    resetLift();
  };

  useEffect(
    () => () => {
      resetStick();
      resetLift();
    },
    [resetLift, resetStick],
  );

  useEffect(() => {
    const handlePointerUp = (event: PointerEvent) => {
      if (stickPointer.current === event.pointerId) resetStick();
      if (liftPointer.current === event.pointerId) resetLift();
    };
    const handleBlur = () => {
      resetStick();
      resetLift();
    };
    const handleVisibility = () => {
      if (document.hidden) handleBlur();
    };
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [resetLift, resetStick]);

  return (
    <div className={styles.controlLayer}>
      <div
        ref={stickRef}
        className={styles.stick}
        onPointerDown={handleStickDown}
        onPointerMove={handleStickMove}
        onPointerUp={handleStickUp}
        onPointerCancel={handleStickUp}
        onLostPointerCapture={handleStickUp}
        role="group"
        aria-label="Drone movement joystick"
      >
        <div ref={knobRef} className={styles.knob} />
        <span className={styles.label}>ROAM</span>
      </div>
      <div className={styles.liftCluster}>
        <button
          type="button"
          className={styles.liftButton}
          onPointerDown={startLift(1)}
          onPointerUp={(event) => stopLift(event.pointerId)}
          onPointerCancel={(event) => stopLift(event.pointerId)}
          onLostPointerCapture={(event) => stopLift(event.pointerId)}
          aria-label="Increase drone altitude"
        >
          ALT+
        </button>
        <button
          type="button"
          className={styles.liftButton}
          onPointerDown={startLift(-1)}
          onPointerUp={(event) => stopLift(event.pointerId)}
          onPointerCancel={(event) => stopLift(event.pointerId)}
          onLostPointerCapture={(event) => stopLift(event.pointerId)}
          aria-label="Decrease drone altitude"
        >
          ALT−
        </button>
      </div>
    </div>
  );
}
