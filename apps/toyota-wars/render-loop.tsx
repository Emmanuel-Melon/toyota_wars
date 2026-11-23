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
import { useFrame, type RootState } from "@react-three/fiber";

export const FRAME_PHASES = [
  "missionPositions",
  "missionClock",
  "squadTargets",
  "squadCommand",
  "input",
  "playerSim",
  "collision",
  "aiSim",
  "postSimSync",
  "weapons",
  "projectiles",
  "vfx",
  "presentation",
  "camera",
  "reticles",
] as const;

export type FramePhase = (typeof FRAME_PHASES)[number];

export type GameFrameCallback = (state: RootState, delta: number) => void;

const CLAMPED_PHASES = new Set<FramePhase>([
  "missionClock",
  "squadTargets",
  "squadCommand",
  "input",
  "playerSim",
  "collision",
  "aiSim",
  "postSimSync",
  "weapons",
  "projectiles",
  "vfx",
]);

type FrameLoopContextValue = {
  register: (phase: FramePhase, callback: GameFrameCallback) => () => void;
  runFrame: (state: RootState, delta: number) => void;
};

const FrameLoopContext = createContext<FrameLoopContextValue | null>(null);

export function FrameLoopProvider({ children }: { children: ReactNode }) {
  const callbacks = useRef(new Map<FramePhase, Set<GameFrameCallback>>());

  const register = useCallback(
    (phase: FramePhase, callback: GameFrameCallback) => {
      let phaseCallbacks = callbacks.current.get(phase);
      if (!phaseCallbacks) {
        phaseCallbacks = new Set();
        callbacks.current.set(phase, phaseCallbacks);
      }
      phaseCallbacks.add(callback);

      return () => {
        phaseCallbacks?.delete(callback);
        if (phaseCallbacks?.size === 0) {
          callbacks.current.delete(phase);
        }
      };
    },
    [],
  );

  const runFrame = useCallback((state: RootState, delta: number) => {
    const clampedDelta = Math.min(delta, 0.1);

    for (const phase of FRAME_PHASES) {
      const phaseCallbacks = callbacks.current.get(phase);
      if (!phaseCallbacks) continue;

      const frameDelta = CLAMPED_PHASES.has(phase) ? clampedDelta : delta;
      for (const callback of Array.from(phaseCallbacks)) {
        callback(state, frameDelta);
      }
    }
  }, []);

  const value = useMemo(() => ({ register, runFrame }), [register, runFrame]);

  return (
    <FrameLoopContext.Provider value={value}>
      {children}
    </FrameLoopContext.Provider>
  );
}

export function useFrameLoop() {
  const loop = useContext(FrameLoopContext);
  if (!loop)
    throw new Error("useFrameLoop must be used inside <FrameLoopProvider>");
  return loop;
}

export function useGameFrame(
  callback: GameFrameCallback,
  phase: FramePhase = "presentation",
) {
  const { register } = useFrameLoop();
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(
    () =>
      register(phase, (state, delta) => {
        callbackRef.current(state, delta);
      }),
    [phase, register],
  );
}

export function GameLoopDriver() {
  const { runFrame } = useFrameLoop();
  useFrame(runFrame);
  return null;
}
