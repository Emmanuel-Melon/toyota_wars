"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CameraMode } from "../feature/camera/camera.types";

type CameraModeContextValue = {
  mode: CameraMode;
  setMode: (mode: CameraMode) => void;
  toggleMode: () => void;
};

const CameraModeContext = createContext<CameraModeContextValue | null>(null);

type Props = {
  children: ReactNode;
  initialMode?: CameraMode;
};

export function CameraModeProvider({ children, initialMode = "chase" }: Props) {
  const [mode, setMode] = useState<CameraMode>(initialMode);

  const value = useMemo<CameraModeContextValue>(
    () => ({
      mode,
      setMode,
      toggleMode: () => setMode((m) => (m === "chase" ? "drone" : "chase")),
    }),
    [mode],
  );

  return (
    <CameraModeContext.Provider value={value}>
      {children}
    </CameraModeContext.Provider>
  );
}

export function useCameraMode(): CameraModeContextValue {
  const ctx = useContext(CameraModeContext);
  if (!ctx) {
    throw new Error("useCameraMode must be used within <CameraModeProvider>");
  }
  return ctx;
}
