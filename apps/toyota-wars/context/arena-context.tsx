"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createArenaRuntime, DEFAULT_ARENA } from "@/lib/map/arena";
import type { ArenaRuntime, ArenaSource } from "@/lib/map/arena";

type ArenaControls = {
  setArenaSource: (source: ArenaSource) => void;
};

const ArenaCtx = createContext<ArenaRuntime | null>(null);
const ArenaControlsCtx = createContext<ArenaControls | null>(null);

export function ArenaProvider({
  children,
  arena,
}: {
  children: ReactNode;
  arena?: ArenaRuntime;
}) {
  const [runtime, setRuntime] = useState(
    () => arena ?? createArenaRuntime(DEFAULT_ARENA),
  );
  const controls = useMemo<ArenaControls>(
    () => ({
      setArenaSource: (source) => setRuntime(createArenaRuntime(source)),
    }),
    [],
  );

  return (
    <ArenaCtx.Provider value={runtime}>
      <ArenaControlsCtx.Provider value={controls}>
        {children}
      </ArenaControlsCtx.Provider>
    </ArenaCtx.Provider>
  );
}

export function useArena(): ArenaRuntime {
  const arena = useContext(ArenaCtx);
  if (!arena) throw new Error("useArena must be used inside ArenaProvider");
  return arena;
}

export function useArenaControls(): ArenaControls {
  const controls = useContext(ArenaControlsCtx);
  if (!controls)
    throw new Error("useArenaControls must be used inside ArenaProvider");
  return controls;
}
