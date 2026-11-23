"use client";

import { usePlayer } from "@/context/player-context";
import { CameraModeControl } from "@/feature/camera/components/camera-mode-control";
import {
  HudButton,
  HudPanel,
  HudStatRow,
} from "@/feature/hud/components/hud-parts";

export function AimCameraControls() {
  const { aimMode, setAimMode } = usePlayer();

  return (
    <HudPanel
      className="pointer-events-auto flex flex-col gap-2 p-3 max-[919px]:p-2"
      aria-label="Aim and camera controls"
    >
      <HudStatRow
        label="AIM · M"
        value={
          <HudButton
            active={aimMode === "auto"}
            onClick={() => setAimMode(aimMode === "auto" ? "manual" : "auto")}
            aria-pressed={aimMode === "auto"}
            className="flex-none px-3"
          >
            {aimMode.toUpperCase()}
          </HudButton>
        }
      />
      <CameraModeControl />
    </HudPanel>
  );
}
