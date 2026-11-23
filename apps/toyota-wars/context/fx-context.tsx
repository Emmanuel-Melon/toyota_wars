// feature/context/fx-context.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { FxBus, type FxEventMap } from "@/lib/fx/fx.bus";

const FxContext = createContext<FxBus | null>(null);

export function FxProvider({ children }: { children: ReactNode }) {
  const bus = useMemo(() => new FxBus(), []);
  return <FxContext.Provider value={bus}>{children}</FxContext.Provider>;
}

export function useFx() {
  const bus = useContext(FxContext);
  if (!bus) throw new Error("useFx must be used inside <FxProvider>");
  return bus;
}

/** Subscribe for the component's lifetime; the handler may close over fresh props. */
export function useFxEvent<K extends keyof FxEventMap>(
  type: K,
  handler: (event: FxEventMap[K]) => void,
) {
  const bus = useFx();
  const latest = useRef(handler);
  latest.current = handler;
  useEffect(() => bus.on(type, (event) => latest.current(event)), [bus, type]);
}
