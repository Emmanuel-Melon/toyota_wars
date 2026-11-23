// apps/toyota-wars/context/missions.context.tsx
import { createContext, useContext, useSyncExternalStore } from "react";
import { useGameFrame } from "@/render-loop";
import type {
  MissionRunner,
  MissionSnapshot,
} from "@/lib/missions/runtime/mission.runner";

export const MissionContext = createContext<MissionRunner | null>(null);

export function useMissionRunner(): MissionRunner {
  const runner = useContext(MissionContext);
  if (!runner)
    throw new Error(
      "useMissionRunner must be used inside <MissionContext.Provider>",
    );
  return runner;
}

/** Reactive mission state for HUD, briefing and result screens. */
export function useMission(): MissionSnapshot {
  const runner = useMissionRunner();
  return useSyncExternalStore(
    runner.subscribe,
    runner.getSnapshot,
    runner.getSnapshot,
  );
}

/**
 * Drives the runner from the render loop. Render once inside <Canvas>.
 * dt is clamped so a backgrounded tab doesn't fast-forward the mission clock.
 */
export function MissionClock({ paused = false }: { paused?: boolean }) {
  const runner = useMissionRunner();
  useGameFrame((_, dt) => {
    if (!paused) runner.update(Math.min(dt, 0.1));
  }, "missionClock");
  return null;
}
