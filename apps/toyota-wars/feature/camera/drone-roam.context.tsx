"use client";

import {
  createContext,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { DRONE_ROAM_CONFIG } from "./camera.config";
import type { DroneRoamInput, DroneRoamState } from "./camera.types";

type StreamFocus = {
  readonly position: {
    readonly x: number;
    readonly z: number;
  };
};

type DroneRoamContextValue = {
  state: DroneRoamState;
  input: DroneRoamInput;
  streamingFocus: StreamFocus;
  reset: (source: {
    readonly x: number;
    readonly z: number;
    readonly heading: number;
  }) => void;
};

const DroneRoamContext = createContext<DroneRoamContextValue | null>(null);

export function DroneRoamProvider({ children }: { children: ReactNode }) {
  const stateRef = useRef<DroneRoamState>({
    x: 0,
    z: 0,
    altitude: DRONE_ROAM_CONFIG.initialAltitude,
    heading: 0,
  });
  const inputRef = useRef<DroneRoamInput>({ forward: 0, strafe: 0, lift: 0 });
  const streamingFocus = useMemo<StreamFocus>(
    () => ({
      get position() {
        return stateRef.current;
      },
    }),
    [],
  );

  const reset = useMemo(
    () =>
      (source: {
        readonly x: number;
        readonly z: number;
        readonly heading: number;
      }) => {
        const state = stateRef.current;
        state.x = source.x;
        state.z = source.z;
        state.altitude = DRONE_ROAM_CONFIG.initialAltitude;
        state.heading = source.heading;
        inputRef.current.forward = 0;
        inputRef.current.strafe = 0;
        inputRef.current.lift = 0;
      },
    [],
  );

  const value = useMemo<DroneRoamContextValue>(
    () => ({
      state: stateRef.current,
      input: inputRef.current,
      streamingFocus,
      reset,
    }),
    [streamingFocus, reset],
  );

  return (
    <DroneRoamContext.Provider value={value}>
      {children}
    </DroneRoamContext.Provider>
  );
}

export function useDroneRoam(): DroneRoamContextValue {
  const ctx = useContext(DroneRoamContext);
  if (!ctx) {
    throw new Error("useDroneRoam must be used within <DroneRoamProvider>");
  }
  return ctx;
}
