"use client";

import "@/lib/missions/missions.data";

import { ViewportProvider, useViewport } from "@/context/viewport-context";
import { LoadingScreen } from "@/feature/game/components/loading-screen";
import { GameView } from "@/feature/game/components/game-view";
import { RotateDeviceOverlay } from "@/feature/game/components/rotate-device-overlay";
import { useGameState } from "@/feature/game/hooks/use-game-state";
import { TutorialGatesProvider } from "@/feature/game/tutorial/tutorial-gates";
import { GameProviders } from "@/game/game-providers";

export function Game() {
  return (
    <ViewportProvider>
      <GameShell />
    </ViewportProvider>
  );
}

function GameShell() {
  const game = useGameState();
  const { isMobile, isPortrait } = useViewport();
  const rotateGateActive =
    isMobile && isPortrait && game.mode === "playing" && game.graphicsReady;

  return (
    <main
      ref={game.shellRef}
      className="game-shell relative overflow-hidden bg-[#c7b18b]"
    >
      <TutorialGatesProvider
        active={game.tutorialActive}
        step={game.tutorialStep}
        onAdvance={game.advanceTutorial}
      >
        <GameProviders
          key={game.round}
          mode={game.mode}
          loadout={game.playerLoadout}
          graphicsReady={game.graphicsReady}
          uiBlocked={rotateGateActive}
        >
          <GameView game={game} onSceneReady={game.markGraphicsReady} />
        </GameProviders>
      </TutorialGatesProvider>
      {!game.graphicsReady && <LoadingScreen />}
      {rotateGateActive && <RotateDeviceOverlay />}
    </main>
  );
}
