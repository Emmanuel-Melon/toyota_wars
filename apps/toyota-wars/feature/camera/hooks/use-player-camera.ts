"use client";

import { useRef } from "react";
import { useGameFrame } from "@/render-loop";
import * as THREE from "three";
import { useArena } from "@/context/arena-context";
import { usePlayer } from "@/context/player-context";
import { useViewport } from "@/context/viewport-context";
import { dampAngle } from "@/lib/aim/aim.math";
import {
  MOBILE_CAMERA_LOOK_CONFIG,
  PLAYER_CAMERA_CONFIG,
} from "../camera.config";
import { useCameraLook } from "../camera-look.context";
import {
  computeCameraFov,
  computeCameraPosition,
  computeCameraTarget,
  computeDroneFov,
  computeDronePosition,
  computeDroneTarget,
} from "../camera.pose";
import { useCameraMode } from "../../../context/camera-mode-context";
import type { CameraPoseInput } from "../camera.types";

export function usePlayerCamera() {
  const {
    playerBody: body,
    playerDamageEffects,
    playerCommand,
    aimMode,
    paused,
    destroyed,
  } = usePlayer();
  const arena = useArena();
  const { mode } = useCameraMode();
  const { isPortrait, isMobile, isTouch } = useViewport();
  const cameraLook = useCameraLook();

  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const pose = useRef<CameraPoseInput>({
    x: 0,
    y: 0,
    z: 0,
    heading: 0,
    visionPenalty: 0,
  });
  const desiredPosition = useRef(new THREE.Vector3());
  const desiredTarget = useRef(new THREE.Vector3());
  const target = useRef(new THREE.Vector3());
  const initialized = useRef(false);
  const currentLook = useRef({ yaw: 0, pitch: 0 });
  const idleTime = useRef(0);
  const lastRevision = useRef(-1);

  useGameFrame((_, delta) => {
    const camera = cameraRef.current;
    if (!camera) return;

    // ── 1. Refresh pose input ─────────────────────────────────────────
    const currentPose = pose.current;
    currentPose.x = body.position.x;
    currentPose.y = body.position.y;
    currentPose.z = body.position.z;
    currentPose.heading = body.heading;
    currentPose.visionPenalty = playerDamageEffects.visionPenalty;
    currentPose.portrait = isPortrait;

    const revision = cameraLook.getRevision();
    if (revision !== lastRevision.current) {
      lastRevision.current = revision;
      currentLook.current.yaw = 0;
      currentLook.current.pitch = 0;
      idleTime.current = 0;
      initialized.current = false;
    }

    const freeLookActive =
      isMobile &&
      isTouch &&
      mode === "chase" &&
      aimMode === "auto" &&
      !paused &&
      !destroyed;

    if (freeLookActive) {
      if (cameraLook.isDragging()) {
        idleTime.current = 0;
      } else {
        idleTime.current += delta;
        const lookTarget = cameraLook.getTarget();
        if (
          idleTime.current >= MOBILE_CAMERA_LOOK_CONFIG.recenterDelay &&
          body.speed > MOBILE_CAMERA_LOOK_CONFIG.forwardSpeed &&
          playerCommand.current.throttle >
            MOBILE_CAMERA_LOOK_CONFIG.forwardThrottle
        ) {
          cameraLook.setTarget(
            dampAngle(
              lookTarget.yaw,
              0,
              MOBILE_CAMERA_LOOK_CONFIG.recenterYawDamping,
              delta,
            ),
            THREE.MathUtils.damp(
              lookTarget.pitch,
              0,
              MOBILE_CAMERA_LOOK_CONFIG.recenterPitchDamping,
              delta,
            ),
          );
        }
      }

      const lookTarget = cameraLook.getTarget();
      currentLook.current.yaw = dampAngle(
        currentLook.current.yaw,
        lookTarget.yaw,
        MOBILE_CAMERA_LOOK_CONFIG.yawDamping,
        delta,
      );
      currentLook.current.pitch = THREE.MathUtils.damp(
        currentLook.current.pitch,
        lookTarget.pitch,
        MOBILE_CAMERA_LOOK_CONFIG.pitchDamping,
        delta,
      );
      currentLook.current.pitch = Math.min(
        MOBILE_CAMERA_LOOK_CONFIG.maxPitch,
        Math.max(MOBILE_CAMERA_LOOK_CONFIG.minPitch, currentLook.current.pitch),
      );
      currentPose.yawOffset = currentLook.current.yaw;
      currentPose.pitchOffset = currentLook.current.pitch;
    } else {
      currentLook.current.yaw = 0;
      currentLook.current.pitch = 0;
      idleTime.current = 0;
      currentPose.yawOffset = 0;
      currentPose.pitchOffset = 0;
    }

    // ── 2. Compute desired pose (mode-dependent) ──────────────────────
    if (mode === "drone") {
      computeDronePosition(currentPose, arena.terrain, desiredPosition.current);
      computeDroneTarget(currentPose, desiredTarget.current);
    } else {
      computeCameraPosition(
        currentPose,
        arena.terrain,
        desiredPosition.current,
      );
      computeCameraTarget(currentPose, desiredTarget.current);
    }

    // ── 3. Damp camera toward desired pose ────────────────────────────
    // First frame snaps (avoids lerping from origin); mode changes lerp
    // naturally because `initialized` only flips once on mount.
    if (!initialized.current) {
      camera.position.copy(desiredPosition.current);
      target.current.copy(desiredTarget.current);
      initialized.current = true;
    } else {
      camera.position.lerp(
        desiredPosition.current,
        1 - Math.exp(-PLAYER_CAMERA_CONFIG.positionDamping * delta),
      );
      target.current.lerp(
        desiredTarget.current,
        1 - Math.exp(-PLAYER_CAMERA_CONFIG.targetDamping * delta),
      );
    }

    // ── 4. FOV — also damped so mode transitions are smooth ───────────
    const targetFov =
      mode === "drone"
        ? computeDroneFov(isPortrait)
        : computeCameraFov(currentPose.visionPenalty, isPortrait);

    if (Math.abs(camera.fov - targetFov) > 0.01) {
      const alpha = 1 - Math.exp(-PLAYER_CAMERA_CONFIG.fovDamping * delta);
      camera.fov += (targetFov - camera.fov) * alpha;
      camera.updateProjectionMatrix();
    }

    camera.lookAt(target.current);
  }, "camera");

  return cameraRef;
}
