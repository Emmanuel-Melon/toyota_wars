"use client";

import { useGameFrame } from "@/render-loop";
import { useMissionFlowRunner } from "./mission-flow.context";

export function MissionFlowClock() {
  const runner = useMissionFlowRunner();

  useGameFrame((_, delta) => {
    runner.update(delta * 1000);
  }, "presentation");

  return null;
}
