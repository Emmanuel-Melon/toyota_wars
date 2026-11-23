"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useViewportMode, type ViewportMode } from "@/hooks/use-is-mobile";

const ViewportContext = createContext<ViewportMode>({
  isMobile: false,
  isPortrait: false,
  isTouch: false,
});

export function ViewportProvider({ children }: { children: ReactNode }) {
  const mode = useViewportMode();

  return (
    <ViewportContext.Provider value={mode}>{children}</ViewportContext.Provider>
  );
}

export function useViewport(): ViewportMode {
  return useContext(ViewportContext);
}
