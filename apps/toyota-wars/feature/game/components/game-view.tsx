"use client";

import { useCallback } from "react";
import { useCombat } from "@/context/combat-context";
import { usePlayer } from "@/context/player-context";
import { useViewport } from "@/context/viewport-context";
import { TutorialOverlay } from "@/feature/game/components/tutorial-overlay";
import type { GameState } from "@/feature/game/game.types";
import { MissionLaunchBridge } from "@/feature/game/components/mission-launch-bridge";
import { useGameScreen } from "@/feature/game/hooks/use-game-screen";
import { useGameShortcuts } from "@/feature/game/hooks/use-game-shortcuts";
import { useTutorialGates } from "@/feature/game/tutorial/tutorial-gates";
import { TouchControls } from "@/feature/controls/components/touch-controls";
import { useCameraTouchLook } from "@/feature/camera/hooks/use-camera-touch-look";
import { Render } from "@/render";
import { GameScreenRouter } from "./game-screen-router";

/**
 * The "inside the providers" half of `<Game>`. Reads the combat/player
 * contexts it needs for shortcuts, resolves the active screen, and lets the
 * router pick the JSX.
 */
export function GameView({
  game,
  onSceneReady,
}: {
  game: GameState;
  onSceneReady: () => void;
}) {
  const {
    onAllyDirectiveChange,
    onAllyFormationChange,
    clearFireDesignation,
    fireDesignation,
    issueAllyAttack,
  } = useCombat();
  const {
    designateFireFromAim,
    getCurrentTargetId,
    aimMode,
    paused,
    destroyed,
  } = usePlayer();
  const { capabilities, reportCommand, reportFormation } = useTutorialGates();
  const { isMobile, isPortrait, isTouch } = useViewport();

  const handleAttack = useCallback(() => {
    issueAllyAttack(
      fireDesignation?.targetId ?? getCurrentTargetId() ?? undefined,
    );
    reportCommand();
  }, [
    fireDesignation?.targetId,
    getCurrentTargetId,
    issueAllyAttack,
    reportCommand,
  ]);

  const handleDirective = useCallback(
    (directive: Parameters<typeof onAllyDirectiveChange>[0]) => {
      onAllyDirectiveChange(directive);
      reportCommand();
    },
    [onAllyDirectiveChange, reportCommand],
  );

  const handleFormation = useCallback(
    (formation: Parameters<typeof onAllyFormationChange>[0]) => {
      onAllyFormationChange(formation);
      reportFormation();
    },
    [onAllyFormationChange, reportFormation],
  );

  const handleDesignateFire = useCallback(
    (group: Parameters<typeof designateFireFromAim>[0]) => {
      designateFireFromAim(group);
      reportCommand();
    },
    [designateFireFromAim, reportCommand],
  );

  const handleClearDesignation = useCallback(() => {
    clearFireDesignation();
    reportCommand();
  }, [clearFireDesignation, reportCommand]);

  useGameShortcuts({
    disabled: !game.graphicsReady,
    hasActiveRound: game.hasActiveRound,
    canCommand: capabilities.canCommand,
    canFormation: capabilities.canFormation,
    onModeChange: game.setMode,
    onAttack: handleAttack,
    onDirective: handleDirective,
    onFormation: handleFormation,
    onDesignateFire: handleDesignateFire,
    onClearDesignation: handleClearDesignation,
  });

  const screen = useGameScreen(game.mode);

  useCameraTouchLook({
    targetRef: game.shellRef,
    enabled:
      isMobile &&
      isTouch &&
      screen.kind === "playing" &&
      game.graphicsReady &&
      !isPortrait &&
      aimMode === "auto" &&
      !paused &&
      !destroyed,
  });

  return (
    <>
      <Render onSceneReady={onSceneReady} />
      <MissionLaunchBridge game={game} />
      <GameScreenRouter screen={screen} game={game} />
      {isMobile && screen.kind === "playing" && <TouchControls game={game} />}
      {game.tutorialActive &&
        game.hasActiveRound &&
        screen.kind === "playing" && <TutorialOverlay game={game} />}
    </>
  );
}
