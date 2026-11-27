"use client";

import { useCameraMode } from "@/context/camera-mode-context";
import { useRadar } from "@/context/radar-context";
import { useViewport } from "@/context/viewport-context";
import { useMissionFlow } from "@/feature/mission-flow/mission-flow.context";
import { HudButton, HudStatRow } from "@/feature/hud/components/hud-parts";
import { nextCameraMode, type CameraMode } from "../camera.types";

const MODE_LABELS: Record<CameraMode, string> = {
  chase: "CHASE",
  drone: "DRONE",
  "drone-roam": "ROAM",
};

export function CameraModeControl() {
  const { mode, cycleMode } = useCameraMode();
  const { radarOnline } = useRadar();
  const { isTouch } = useViewport();
  const { phase } = useMissionFlow();
  const flowActive = phase !== "gameplay";
  const desktopRoam = !isTouch;

  const nextMode: CameraMode = !radarOnline ? "chase" : nextCameraMode(mode);
  const handleClick = () => {
    if (flowActive || !radarOnline) return;
    cycleMode();
  };

  return (
    <HudStatRow
      label="CAM · V"
      value={
        <HudButton
          active={!flowActive && radarOnline && mode !== "chase"}
          disabled={flowActive || !radarOnline}
          onClick={handleClick}
          aria-pressed={!flowActive && radarOnline && mode !== "chase"}
          aria-label={
            flowActive
              ? "Camera controls are locked during the sequence."
              : radarOnline
                ? `Camera mode: ${MODE_LABELS[mode]}. Switch to ${MODE_LABELS[nextMode]} mode.`
                : "Camera mode: chase. Radar offline; drone unavailable."
          }
          title={
            flowActive
              ? "Camera controls are locked during the sequence."
              : radarOnline
                ? desktopRoam
                  ? "Cycle camera mode (V). In roam: WASD move, Q/E altitude."
                  : "Toggle camera mode"
                : "Radar offline; drone camera unavailable."
          }
          className="flex-none px-3"
        >
          {radarOnline ? MODE_LABELS[mode] : "NO RADAR"}
        </HudButton>
      }
    />
  );
}
