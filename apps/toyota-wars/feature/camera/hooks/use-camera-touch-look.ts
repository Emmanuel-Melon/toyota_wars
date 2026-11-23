"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useCameraMode } from "@/context/camera-mode-context";
import { MOBILE_CAMERA_LOOK_CONFIG } from "@/feature/camera/camera.config";
import { useCameraLook } from "@/feature/camera/camera-look.context";

type CameraGesture = {
  id: number;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  armed: boolean;
};

function isLookSurface(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    target.closest("canvas, [data-camera-look-surface]") !== null
  );
}

export function useCameraTouchLook({
  targetRef,
  enabled,
}: {
  targetRef: RefObject<HTMLElement | null>;
  enabled: boolean;
}) {
  const cameraLook = useCameraLook();
  const { mode } = useCameraMode();
  const gestureRef = useRef<CameraGesture | null>(null);
  const active = enabled && mode === "chase";

  useEffect(() => {
    const element = targetRef.current;
    if (!element || !active) return;

    const handleStart = (event: TouchEvent) => {
      if (gestureRef.current) return;
      for (const touch of event.changedTouches) {
        if (!isLookSurface(touch.target)) continue;
        gestureRef.current = {
          id: touch.identifier,
          startX: touch.clientX,
          startY: touch.clientY,
          lastX: touch.clientX,
          lastY: touch.clientY,
          armed: false,
        };
        cameraLook.setDragging(true);
        if (event.cancelable) event.preventDefault();
        return;
      }
    };

    const handleMove = (event: TouchEvent) => {
      const gesture = gestureRef.current;
      if (!gesture) return;
      const touch = Array.from(event.changedTouches).find(
        (candidate) => candidate.identifier === gesture.id,
      );
      if (!touch) return;
      if (event.cancelable) event.preventDefault();

      if (!gesture.armed) {
        const totalX = touch.clientX - gesture.startX;
        const totalY = touch.clientY - gesture.startY;
        const total = Math.hypot(totalX, totalY);
        if (total < MOBILE_CAMERA_LOOK_CONFIG.deadzonePx) return;
        gesture.armed = true;
        const scale = MOBILE_CAMERA_LOOK_CONFIG.deadzonePx / total;
        gesture.lastX = touch.clientX - totalX * scale;
        gesture.lastY = touch.clientY - totalY * scale;
      }

      cameraLook.addDrag(
        touch.clientX - gesture.lastX,
        touch.clientY - gesture.lastY,
      );
      gesture.lastX = touch.clientX;
      gesture.lastY = touch.clientY;
    };

    const handleEnd = (event: TouchEvent) => {
      const gesture = gestureRef.current;
      if (!gesture) return;
      const ended = Array.from(event.changedTouches).some(
        (touch) => touch.identifier === gesture.id,
      );
      if (!ended) return;
      gestureRef.current = null;
      cameraLook.setDragging(false);
      if (event.cancelable) event.preventDefault();
    };

    element.addEventListener("touchstart", handleStart, {
      capture: true,
      passive: false,
    });
    element.addEventListener("touchmove", handleMove, {
      capture: true,
      passive: false,
    });
    element.addEventListener("touchend", handleEnd, {
      capture: true,
      passive: false,
    });
    element.addEventListener("touchcancel", handleEnd, {
      capture: true,
      passive: false,
    });

    return () => {
      element.removeEventListener("touchstart", handleStart, true);
      element.removeEventListener("touchmove", handleMove, true);
      element.removeEventListener("touchend", handleEnd, true);
      element.removeEventListener("touchcancel", handleEnd, true);
      if (gestureRef.current) {
        gestureRef.current = null;
        cameraLook.setDragging(false);
      }
    };
  }, [targetRef, active, cameraLook]);
}
