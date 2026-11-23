"use client";

import { useEffect } from "react";
import { useCameraMode } from "../../../context/camera-mode-context";

/**
 * Binds a key to toggle between chase and drone camera modes.
 * Mount once (e.g. alongside your HUD) with the key you want.
 */
export function useCameraModeToggle(key: string = "KeyV") {
  const { toggleMode } = useCameraMode();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === key && !e.repeat) toggleMode();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [key, toggleMode]);
}
