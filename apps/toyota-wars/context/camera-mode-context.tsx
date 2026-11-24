"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRadar } from "@/context/radar-context";
import {
  isDroneMode,
  nextCameraMode,
  type CameraMode,
} from "../feature/camera/camera.types";

type CameraModeContextValue = {
  mode: CameraMode;
  setMode: (mode: CameraMode) => void;
  cycleMode: () => void;
};

const CameraModeContext = createContext<CameraModeContextValue | null>(null);

type Props = {
  children: ReactNode;
  initialMode?: CameraMode;
};

export function CameraModeProvider({ children, initialMode = "chase" }: Props) {
  const { radarOnline } = useRadar();
  const [mode, setInternalMode] = useState<CameraMode>(initialMode);

  const resolveMode = useCallback(
    (candidate: CameraMode): CameraMode =>
      !radarOnline && isDroneMode(candidate) ? "chase" : candidate,
    [radarOnline],
  );

  const setMode = useCallback(
    (candidate: CameraMode) => setInternalMode(resolveMode(candidate)),
    [resolveMode],
  );

  const cycleMode = useCallback(
    () => setInternalMode((current) => resolveMode(nextCameraMode(current))),
    [resolveMode],
  );

  useEffect(() => {
    if (radarOnline) return;
    setInternalMode((current) => (isDroneMode(current) ? "chase" : current));
  }, [radarOnline]);

  const value = useMemo<CameraModeContextValue>(
    () => ({
      mode,
      setMode,
      cycleMode,
    }),
    [mode, setMode, cycleMode],
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
