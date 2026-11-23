"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  getTutorialCapabilities,
  TUTORIAL_ADVANCE_DELAY_MS,
  TUTORIAL_SHOTS_REQUIRED,
  TUTORIAL_STEP_COMMAND,
  TUTORIAL_STEP_FIRE,
  TUTORIAL_STEP_FORMATION,
  TUTORIAL_STEP_MOVE,
  UNRESTRICTED_CAPABILITIES,
  type TutorialCapabilities,
} from "./tutorial-steps";

type TutorialGateValue = {
  active: boolean;
  capabilities: TutorialCapabilities;
  shotsFired: number;
  reportForward: () => void;
  reportShot: () => void;
  reportCommand: () => void;
  reportFormation: () => void;
};

const TutorialGateContext = createContext<TutorialGateValue | null>(null);

export function TutorialGatesProvider({
  active,
  step,
  onAdvance,
  children,
}: {
  active: boolean;
  step: number;
  onAdvance: () => void;
  children: ReactNode;
}) {
  const [shotsFired, setShotsFired] = useState(0);
  const shotsRef = useRef(0);
  const completedRef = useRef(false);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAdvanceTimer = useCallback(() => {
    if (advanceTimerRef.current === null) return;
    clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = null;
  }, []);

  useEffect(() => {
    clearAdvanceTimer();
    shotsRef.current = 0;
    completedRef.current = false;
    setShotsFired(0);
  }, [active, clearAdvanceTimer, step]);

  useEffect(() => clearAdvanceTimer, [clearAdvanceTimer]);

  const completeStep = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    advanceTimerRef.current = setTimeout(() => {
      advanceTimerRef.current = null;
      onAdvance();
    }, TUTORIAL_ADVANCE_DELAY_MS);
  }, [onAdvance]);

  const reportForward = useCallback(() => {
    if (!active || step !== TUTORIAL_STEP_MOVE) return;
    completeStep();
  }, [active, completeStep, step]);

  const reportShot = useCallback(() => {
    if (!active || step !== TUTORIAL_STEP_FIRE) return;
    const next = shotsRef.current + 1;
    shotsRef.current = next;
    setShotsFired(next);
    if (next >= TUTORIAL_SHOTS_REQUIRED) completeStep();
  }, [active, completeStep, step]);

  const reportCommand = useCallback(() => {
    if (!active || step !== TUTORIAL_STEP_COMMAND) return;
    completeStep();
  }, [active, completeStep, step]);

  const reportFormation = useCallback(() => {
    if (!active || step !== TUTORIAL_STEP_FORMATION) return;
    completeStep();
  }, [active, completeStep, step]);

  const value = useMemo<TutorialGateValue>(
    () => ({
      active,
      capabilities: active
        ? getTutorialCapabilities(step)
        : UNRESTRICTED_CAPABILITIES,
      shotsFired,
      reportForward,
      reportShot,
      reportCommand,
      reportFormation,
    }),
    [
      active,
      step,
      shotsFired,
      reportForward,
      reportShot,
      reportCommand,
      reportFormation,
    ],
  );

  return (
    <TutorialGateContext.Provider value={value}>
      {children}
    </TutorialGateContext.Provider>
  );
}

export function useTutorialGates(): TutorialGateValue {
  const value = useContext(TutorialGateContext);
  if (!value) {
    throw new Error(
      "useTutorialGates must be used within TutorialGatesProvider",
    );
  }
  return value;
}
