import type { FlowSnapshot } from "@/feature/mission-flow/mission-flow.types";
import { CutsceneScreen } from "@/feature/mission-flow/components/cutscene-screen";
import { QteOverlay } from "@/feature/mission-flow/components/qte-overlay";
import type { GameState, GameScreen } from "../game.types";
import { PlayingHud } from "./playing-hud";
import { GameOverScreen, MissionResultScreen } from "../screens/result-screens";
import {
  MainMenuScreen,
  MissionSelectScreen,
  NewGameScreen,
  SurvivalScreen,
  VehicleSelectScreen,
} from "../screens/menu-screens";

type Props = { screen: GameScreen; game: GameState; flow: FlowSnapshot };

export function GameScreenRouter({ screen, game, flow }: Props) {
  switch (screen.kind) {
    case "mission-result":
      return <MissionResultScreen game={game} />;
    case "game-over":
      return <GameOverScreen winner={screen.winner} game={game} />;
    case "playing":
      if (flow.phase === "cutscene") return <CutsceneScreen />;
      return (
        <>
          <PlayingHud game={game} shellRef={game.shellRef} />
          {flow.phase === "qte" && <QteOverlay />}
        </>
      );
    case "new-game":
      return <NewGameScreen game={game} />;
    case "survival":
      return <SurvivalScreen game={game} />;
    case "mission-select":
      return <MissionSelectScreen game={game} />;
    case "vehicle-select":
      return <VehicleSelectScreen game={game} />;
    case "main-menu":
      return <MainMenuScreen game={game} subMode={screen.subMode} />;
  }
}
