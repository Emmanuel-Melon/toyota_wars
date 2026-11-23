"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useArena } from "@/context/arena-context";
import { useCameraMode } from "@/context/camera-mode-context";
import type { GameMode } from "@/feature/game/game.types";
import { wrapAngle } from "@/lib/movement/movement.math";
import { MOBILE_CAMERA_LOOK_CONFIG } from "./camera.config";

export type CameraLookTarget = {
  yaw: number;
  pitch: number;
};

type CameraLookContextValue = {
  getTarget: () => CameraLookTarget;
  isDragging: () => boolean;
  getRevision: () => number;
  addDrag: (deltaX: number, deltaY: number) => void;
  setDragging: (dragging: boolean) => void;
  setTarget: (yaw: number, pitch: number) => void;
  reset: () => void;
};

const CameraLookContext = createContext<CameraLookContextValue | null>(null);

function clampPitch(pitch: number): number {
  return Math.min(
    MOBILE_CAMERA_LOOK_CONFIG.maxPitch,
    Math.max(MOBILE_CAMERA_LOOK_CONFIG.minPitch, pitch),
  );
}

export function CameraLookProvider({
  children,
  screenMode,
}: {
  children: ReactNode;
  screenMode: GameMode;
}) {
  const arena = useArena();
  const { mode: cameraMode } = useCameraMode();
  const targetRef = useRef<CameraLookTarget>({ yaw: 0, pitch: 0 });
  const draggingRef = useRef(false);
  const revisionRef = useRef(0);

  const getTarget = useCallback(() => targetRef.current, []);
  const isDragging = useCallback(() => draggingRef.current, []);
  const getRevision = useCallback(() => revisionRef.current, []);

  const setDragging = useCallback((dragging: boolean) => {
    draggingRef.current = dragging;
  }, []);

  const setTarget = useCallback((yaw: number, pitch: number) => {
    targetRef.current.yaw = wrapAngle(yaw);
    targetRef.current.pitch = clampPitch(pitch);
  }, []);

  const addDrag = useCallback((deltaX: number, deltaY: number) => {
    const target = targetRef.current;
    target.yaw = wrapAngle(
      target.yaw + deltaX * MOBILE_CAMERA_LOOK_CONFIG.yawSensitivity,
    );
    target.pitch = clampPitch(
      target.pitch - deltaY * MOBILE_CAMERA_LOOK_CONFIG.pitchSensitivity,
    );
  }, []);

  const reset = useCallback(() => {
    targetRef.current.yaw = 0;
    targetRef.current.pitch = 0;
    draggingRef.current = false;
    revisionRef.current += 1;
  }, []);

  useEffect(() => {
    reset();
  }, [arena, reset]);

  useEffect(() => {
    if (screenMode !== "playing" || cameraMode !== "chase") reset();
  }, [screenMode, cameraMode, reset]);

  const value = useMemo<CameraLookContextValue>(
    () => ({
      getTarget,
      isDragging,
      getRevision,
      addDrag,
      setDragging,
      setTarget,
      reset,
    }),
    [
      getTarget,
      isDragging,
      getRevision,
      addDrag,
      setDragging,
      setTarget,
      reset,
    ],
  );

  return (
    <CameraLookContext.Provider value={value}>
      {children}
    </CameraLookContext.Provider>
  );
}

export function useCameraLook(): CameraLookContextValue {
  const ctx = useContext(CameraLookContext);
  if (!ctx) {
    throw new Error("useCameraLook must be used within <CameraLookProvider>");
  }
  return ctx;
}
