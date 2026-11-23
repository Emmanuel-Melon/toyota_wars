"use client";

import { useRef } from "react";
import { useGameFrame } from "@/render-loop";

export function SceneReadyProbe({ onReady }: { onReady: () => void }) {
  const firedRef = useRef(false);

  useGameFrame(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    requestAnimationFrame(onReady);
  }, "reticles");

  return null;
}
