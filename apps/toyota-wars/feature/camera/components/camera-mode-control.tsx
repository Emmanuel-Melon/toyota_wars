"use client";

import { useCameraMode } from "@/context/camera-mode-context";
import { useCameraModeToggle } from "../hooks/use-camera-mode-toggle";
import { HudButton, HudStatRow } from "@/feature/hud/components/hud-parts";

export function CameraModeControl() {
  const { mode, toggleMode } = useCameraMode();
  useCameraModeToggle("KeyV");

  return (
    <HudStatRow
      label="CAM · V"
      value={
        <HudButton
          active={mode === "drone"}
          onClick={toggleMode}
          aria-pressed={mode === "drone"}
          aria-label={`Camera mode: ${mode}. Switch to ${mode === "chase" ? "drone" : "chase"} mode.`}
          title="Toggle camera mode (V)"
          className="flex-none px-3"
        >
          {mode.toUpperCase()}
        </HudButton>
      }
    />
  );
}
