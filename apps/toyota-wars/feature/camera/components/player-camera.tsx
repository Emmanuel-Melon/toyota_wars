// apps/toyota-wars/feature/camera/player-camera.tsx
"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useViewport } from "@/context/viewport-context";
import {
  PLAYER_CAMERA_CONFIG,
  PORTRAIT_CAMERA_FRAMING,
} from "../camera.config";
import { usePlayerCamera } from "../hooks/use-player-camera";

export function PlayerCamera() {
  const cameraRef = usePlayerCamera();
  const { isPortrait } = useViewport();

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      fov={
        PLAYER_CAMERA_CONFIG.fov *
        (isPortrait ? PORTRAIT_CAMERA_FRAMING.chaseFov : 1)
      }
      near={PLAYER_CAMERA_CONFIG.near}
      far={PLAYER_CAMERA_CONFIG.far}
    />
  );
}
