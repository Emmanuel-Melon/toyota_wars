"use client";

import { useEffect, useRef } from "react";
import { useArena } from "@/context/arena-context";
import { useCameraMode } from "@/context/camera-mode-context";
import { usePlayer } from "@/context/player-context";
import { useViewport } from "@/context/viewport-context";
import { useMissionFlow } from "@/feature/mission-flow/mission-flow.context";
import { useGameFrame } from "@/render-loop";
import {
  BACKWARD_KEYS,
  DRIVE_KEYS,
  DRONE_DOWN_KEYS,
  DRONE_UP_KEYS,
  FORWARD_KEYS,
  LEFT_KEYS,
  RIGHT_KEYS,
} from "@/feature/controls/keyboard-bindings";
import { DRONE_ROAM_CONFIG } from "../camera.config";
import { isRoamMode } from "../camera.types";
import { useDroneRoam } from "../drone-roam.context";

const hasAny = (pressed: ReadonlySet<string>, keys: readonly string[]) =>
  keys.some((key) => pressed.has(key));

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function DroneRoamController() {
  const { mode } = useCameraMode();
  const { isMobile, isTouch } = useViewport();
  const {
    playerBody: body,
    playerCommand: command,
    paused,
    destroyed,
  } = usePlayer();
  const arena = useArena();
  const { state, reset } = useDroneRoam();
  const { phase } = useMissionFlow();
  const controlsLocked = paused || destroyed || phase !== "gameplay";
  const roamActive = isRoamMode(mode);
  const desktopRoam = !isMobile && !isTouch;
  const pressed = useRef(new Set<string>());
  const modeRef = useRef(mode);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    if (!roamActive) {
      pressed.current.clear();
      return;
    }
    reset({ x: body.position.x, z: body.position.z, heading: body.heading });
    command.current.throttle = 0;
    command.current.steer = 0;
    command.current.desiredHeading = null;
    body.halt();
  }, [body, command, reset, roamActive]);

  useEffect(() => {
    if (!desktopRoam) return;
    const keys = new Set<string>([
      ...DRIVE_KEYS,
      ...DRONE_UP_KEYS,
      ...DRONE_DOWN_KEYS,
    ]);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isRoamMode(modeRef.current) || controlsLocked) return;
      const key = event.key.toLowerCase();
      if (keys.has(key)) {
        event.preventDefault();
        pressed.current.add(key);
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      pressed.current.delete(event.key.toLowerCase());
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [controlsLocked, desktopRoam]);

  useGameFrame((_, delta) => {
    if (!roamActive || !desktopRoam || controlsLocked) {
      pressed.current.clear();
      return;
    }

    const keys = pressed.current;
    const forward =
      (hasAny(keys, FORWARD_KEYS) ? 1 : 0) -
      (hasAny(keys, BACKWARD_KEYS) ? 1 : 0);
    const strafe =
      (hasAny(keys, RIGHT_KEYS) ? 1 : 0) - (hasAny(keys, LEFT_KEYS) ? 1 : 0);
    const lift =
      (hasAny(keys, DRONE_UP_KEYS) ? 1 : 0) -
      (hasAny(keys, DRONE_DOWN_KEYS) ? 1 : 0);

    if (forward !== 0 || strafe !== 0) {
      const sin = Math.sin(state.heading);
      const cos = Math.cos(state.heading);
      const distance = DRONE_ROAM_CONFIG.moveSpeed * delta;
      const limit = Math.max(1, arena.bound - DRONE_ROAM_CONFIG.edgeMargin);
      state.x = clamp(
        state.x + (sin * forward + cos * strafe) * distance,
        -limit,
        limit,
      );
      state.z = clamp(
        state.z + (cos * forward - sin * strafe) * distance,
        -limit,
        limit,
      );
    }

    if (lift !== 0) {
      state.altitude = clamp(
        state.altitude + lift * DRONE_ROAM_CONFIG.altitudeSpeed * delta,
        DRONE_ROAM_CONFIG.minAltitude,
        DRONE_ROAM_CONFIG.maxAltitude,
      );
    }
  }, "input");

  return null;
}
