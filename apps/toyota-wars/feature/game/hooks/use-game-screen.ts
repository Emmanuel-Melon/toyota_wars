"use client";

import { useCombat } from "@/context/combat-context";
import { useMission } from "@/context/missions.context";
import type { GameMode, GameScreen } from "../game.types";

/**
 * Resolves the single screen to render. Encodes the precedence rules that
 * were previously a nested ternary:
 *
 *   mission-finished > game-over > playing > mission-select > vehicle-select > menu
 */
export function useGameScreen(mode: GameMode): GameScreen {
  const { winner } = useCombat();
  const { status } = useMission();

  const missionFinished = status === "success" || status === "failed";
  if (missionFinished) return { kind: "mission-result" };

  const missionActive = status === "briefing" || status === "active";
  if (
    winner &&
    !missionActive &&
    mode !== "vehicle-select" &&
    mode !== "mission-select" &&
    mode !== "new-game" &&
    mode !== "survival"
  ) {
    return { kind: "game-over", winner };
  }

  if (mode === "playing") return { kind: "playing" };
  if (mode === "new-game") return { kind: "new-game" };
  if (mode === "survival") return { kind: "survival" };
  if (mode === "mission-select") return { kind: "mission-select" };
  if (mode === "vehicle-select") return { kind: "vehicle-select" };
  return {
    kind: "main-menu",
    subMode: mode === "settings" ? "settings" : "menu",
  };
}
