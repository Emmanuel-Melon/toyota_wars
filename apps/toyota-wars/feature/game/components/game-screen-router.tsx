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

type Props = { screen: GameScreen; game: GameState };

/** Renders exactly one screen based on the resolved `GameScreen`. */
export function GameScreenRouter({ screen, game }: Props) {
  switch (screen.kind) {
    case "mission-result":
      return <MissionResultScreen game={game} />;
    case "game-over":
      return <GameOverScreen winner={screen.winner} game={game} />;
    case "playing":
      return <PlayingHud game={game} shellRef={game.shellRef} />;
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
