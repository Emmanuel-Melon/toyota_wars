"use client";

import { useEffect } from "react";
import { useMissionFlow } from "@/feature/mission-flow/mission-flow.context";
import { useCameraMode } from "../../../context/camera-mode-context";

/**
 * Binds a key to cycle camera modes.
 * Mount once (e.g. alongside your HUD) with the key you want.
 */
export function useCameraModeToggle(key: string = "KeyV") {
  const { cycleMode } = useCameraMode();
  const { phase } = useMissionFlow();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase !== "gameplay" || e.code !== key || e.repeat) return;
      cycleMode();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cycleMode, key, phase]);
}
