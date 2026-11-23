"use client";

import { useEffect, useRef } from "react";
import { useMissionSession } from "@/feature/missions/components/mission-session";
import { MISSIONS } from "@/lib/missions/missions.data";
import type { GameState } from "../game.types";

export function MissionLaunchBridge({ game }: { game: GameState }) {
  const { startMission } = useMissionSession();
  const launched = useRef(false);
  const {
    mode,
    pendingMissionId,
    hasActiveRound,
    setHasActiveRound,
    clearPendingMission,
  } = game;

  useEffect(() => {
    if (launched.current) return;
    if (mode !== "playing" || hasActiveRound || !pendingMissionId) return;

    const mission = MISSIONS.find(
      (candidate) => candidate.id === pendingMissionId,
    );
    if (!mission) return;

    launched.current = true;
    startMission(mission);
    setHasActiveRound(true);
    clearPendingMission();
  }, [
    mode,
    pendingMissionId,
    hasActiveRound,
    startMission,
    setHasActiveRound,
    clearPendingMission,
  ]);

  return null;
}
