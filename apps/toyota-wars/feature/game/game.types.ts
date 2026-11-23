import type { Dispatch, RefObject, SetStateAction } from "react";
import type { Team } from "@/lib/combat/combat.types";
import type { VehicleLoadout } from "@/lib/vehicles/vehicle.types";

export type GameMode =
  | "menu"
  | "new-game"
  | "survival"
  | "vehicle-select"
  | "mission-select"
  | "playing"
  | "settings";

/** UI state + transitions. Returned by `useGameState`. */
export type GameState = {
  mode: GameMode;
  round: number;
  playerLoadout: VehicleLoadout;
  pendingMissionId: string | null;
  hasActiveRound: boolean;
  tutorialActive: boolean;
  tutorialStep: number;
  graphicsReady: boolean;
  shellRef: RefObject<HTMLElement | null>;

  setMode: Dispatch<SetStateAction<GameMode>>;
  setHasActiveRound: Dispatch<SetStateAction<boolean>>;

  openNewGame: () => void;
  openMissionSelect: () => void;
  selectMission: (missionId: string) => void;
  clearPendingMission: () => void;
  confirmLoadout: (loadout: VehicleLoadout) => void;
  startTutorial: () => void;
  advanceTutorial: () => void;
  endTutorial: () => void;
  markGraphicsReady: () => void;
};

/** Resolved screen to render. Encodes the precedence rules from the
 *  original nested ternary — one place to reason about. */
export type GameScreen =
  | { kind: "mission-result" }
  | { kind: "game-over"; winner: Team }
  | { kind: "playing" }
  | { kind: "new-game" }
  | { kind: "survival" }
  | { kind: "mission-select" }
  | { kind: "vehicle-select" }
  | { kind: "main-menu"; subMode: "menu" | "settings" };
