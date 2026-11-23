// components/plains/three/keyboard-navigator.tsx
"use client";

import { useEffect, useRef } from "react";
import { useGameFrame } from "@/render-loop";
import { usePlayer } from "@/context/player-context";
import { useTutorialGates } from "@/feature/game/tutorial/tutorial-gates";
import {
  BACKWARD_KEYS,
  DRIVE_KEYS,
  FORWARD_KEYS,
  LEFT_KEYS,
  RIGHT_KEYS,
} from "../keyboard-bindings";

const hasAny = (pressed: ReadonlySet<string>, keys: readonly string[]) =>
  keys.some((key) => pressed.has(key));

/** Captures player keys and writes a drive command. Never moves a body itself. */
export function KeyboardNavigator() {
  const { playerCommand: command, paused, destroyed } = usePlayer();
  const { capabilities, reportForward } = useTutorialGates();
  const pressedKeys = useRef(new Set<string>());
  const pausedRef = useRef(paused);
  const destroyedRef = useRef(destroyed);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    destroyedRef.current = destroyed;
    if (destroyed) pressedKeys.current.clear();
  }, [destroyed]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (pausedRef.current || destroyedRef.current) return;
      const key = event.key.toLowerCase();
      const allowedKeys = capabilities.forwardOnly ? FORWARD_KEYS : DRIVE_KEYS;
      if ((allowedKeys as readonly string[]).includes(key)) {
        event.preventDefault();
        pressedKeys.current.add(key);
      }
    };
    const handleKeyUp = (event: KeyboardEvent) =>
      pressedKeys.current.delete(event.key.toLowerCase());
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [capabilities]);

  useGameFrame(() => {
    if (paused || destroyed) {
      pressedKeys.current.clear();
      command.current.throttle = 0;
      command.current.steer = 0;
      command.current.desiredHeading = null;
      return;
    }

    const keys = pressedKeys.current;
    const forward = hasAny(keys, FORWARD_KEYS);
    const backward = !capabilities.forwardOnly && hasAny(keys, BACKWARD_KEYS);
    const left = !capabilities.forwardOnly && hasAny(keys, LEFT_KEYS);
    const right = !capabilities.forwardOnly && hasAny(keys, RIGHT_KEYS);

    command.current.throttle = (forward ? 1 : 0) - (backward ? 1 : 0);
    command.current.steer = (right ? 1 : 0) - (left ? 1 : 0);
    command.current.desiredHeading = null;
    if (forward) reportForward();
  }, "input");

  return null;
}
