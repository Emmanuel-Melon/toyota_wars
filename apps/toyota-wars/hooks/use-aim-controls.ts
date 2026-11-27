"use client";

import { AIM_KEY_SPEED, clampAim, type AimState } from "@toyota/combat";
import { useEffect, type RefObject } from "react";

const AIM_KEYS = ["i", "j", "k", "l"];

export function useAimControls(
  aimRef: RefObject<AimState>,
  containerRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const pressedKeys = new Set<string>();

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      if (event.target instanceof Element && event.target.closest("button")) {
        return;
      }
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0 || rect.height === 0) return;
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      aimRef.current = clampAim({ x, y });
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (AIM_KEYS.includes(key)) {
        event.preventDefault();
        pressedKeys.add(key);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) =>
      pressedKeys.delete(event.key.toLowerCase());

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const delta = (now - last) / 1000;
      last = now;

      let moved = false;
      const aim = aimRef.current;
      if (pressedKeys.has("i")) {
        aim.y += AIM_KEY_SPEED * delta;
        moved = true;
      }
      if (pressedKeys.has("k")) {
        aim.y -= AIM_KEY_SPEED * delta;
        moved = true;
      }
      if (pressedKeys.has("j")) {
        aim.x -= AIM_KEY_SPEED * delta;
        moved = true;
      }
      if (pressedKeys.has("l")) {
        aim.x += AIM_KEY_SPEED * delta;
        moved = true;
      }
      if (moved) {
        aimRef.current = clampAim(aim);
      }

      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(frame);
    };
  }, [aimRef, containerRef]);
}
