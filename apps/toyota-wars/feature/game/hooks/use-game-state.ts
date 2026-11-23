"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TUTORIAL_MISSION_ID } from "@/lib/missions/missions.data";
import { DEFAULT_PLAYER_LOADOUT } from "@/lib/vehicles/vehicle.config";
import type { VehicleLoadout } from "@/lib/vehicles/vehicle.types";
import { TUTORIAL_STEP_COUNT } from "../tutorial/tutorial-steps";
import type { GameMode, GameState } from "../game.types";

const MIN_LOADING_MS = 600;

/** Owns all game-shell UI state and transitions. */
export function useGameState(): GameState {
  const shellRef = useRef<HTMLElement>(null);
  const [mode, setMode] = useState<GameMode>("menu");
  const [round, setRound] = useState(0);
  const [playerLoadout, setPlayerLoadout] = useState<VehicleLoadout>(
    DEFAULT_PLAYER_LOADOUT,
  );
  const [pendingMissionId, setPendingMissionId] = useState<string | null>(null);
  const [hasActiveRound, setHasActiveRound] = useState(false);
  const [tutorialActive, setTutorialActive] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [readyRound, setReadyRound] = useState<number | null>(null);
  const loadStartedAtRef = useRef(Date.now());
  const readyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentRoundRef = useRef(round);

  useEffect(() => {
    currentRoundRef.current = round;
    loadStartedAtRef.current = Date.now();
    if (readyTimerRef.current) clearTimeout(readyTimerRef.current);
    readyTimerRef.current = null;
  }, [round]);

  useEffect(
    () => () => {
      if (readyTimerRef.current) clearTimeout(readyTimerRef.current);
    },
    [],
  );

  const markGraphicsReady = useCallback(() => {
    if (round !== currentRoundRef.current || readyTimerRef.current) return;
    const remaining = Math.max(
      0,
      MIN_LOADING_MS - (Date.now() - loadStartedAtRef.current),
    );
    readyTimerRef.current = setTimeout(() => {
      readyTimerRef.current = null;
      if (round === currentRoundRef.current) setReadyRound(round);
    }, remaining);
  }, [round]);

  const resetRunState = useCallback(() => {
    setPendingMissionId(null);
    setHasActiveRound(false);
    setTutorialActive(false);
    setTutorialStep(0);
  }, []);

  const openNewGame = useCallback(() => {
    resetRunState();
    setMode("new-game");
  }, [resetRunState]);

  const openMissionSelect = useCallback(() => {
    resetRunState();
    setMode("mission-select");
  }, [resetRunState]);

  const selectMission = useCallback((missionId: string) => {
    setPendingMissionId(missionId);
    setTutorialActive(false);
    setTutorialStep(0);
    setMode("vehicle-select");
  }, []);

  const clearPendingMission = useCallback(() => setPendingMissionId(null), []);

  const confirmLoadout = useCallback((loadout: VehicleLoadout) => {
    setPlayerLoadout(loadout);
    setRound((current) => current + 1);
    setHasActiveRound(false);
    setTutorialActive(false);
    setTutorialStep(0);
    setMode("playing");
  }, []);

  const startTutorial = useCallback(() => {
    setPlayerLoadout(DEFAULT_PLAYER_LOADOUT);
    setPendingMissionId(TUTORIAL_MISSION_ID);
    setHasActiveRound(false);
    setRound((current) => current + 1);
    setTutorialStep(0);
    setTutorialActive(true);
    setMode("playing");
  }, []);

  const advanceTutorial = useCallback(
    () =>
      setTutorialStep((current) => Math.min(current + 1, TUTORIAL_STEP_COUNT)),
    [],
  );

  const endTutorial = useCallback(() => {
    setTutorialActive(false);
    setTutorialStep(0);
    setPendingMissionId(null);
    setHasActiveRound(false);
    setMode("menu");
  }, []);

  const graphicsReady = readyRound === round;

  return {
    mode,
    round,
    playerLoadout,
    pendingMissionId,
    hasActiveRound,
    tutorialActive,
    tutorialStep,
    graphicsReady,
    shellRef,
    setMode,
    setHasActiveRound,
    openNewGame,
    openMissionSelect,
    selectMission,
    clearPendingMission,
    confirmLoadout,
    startTutorial,
    advanceTutorial,
    endTutorial,
    markGraphicsReady,
  };
}
