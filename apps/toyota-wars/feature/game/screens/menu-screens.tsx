import {
  GameMenu,
  NewGameMenu,
  SurvivalMenu,
  VehicleSelectMenu,
} from "@/feature/menu/components/game-menu";
import { MissionSelectMenu } from "@/feature/missions/components/mission-select-menu";
import type { GameState } from "../game.types";

export function MissionSelectScreen({ game }: { game: GameState }) {
  return (
    <MissionSelectMenu
      onLaunch={(mission) => game.selectMission(mission.id)}
      onBack={() => game.setMode("menu")}
    />
  );
}

export function NewGameScreen({ game }: { game: GameState }) {
  return (
    <NewGameMenu
      onCampaign={game.openMissionSelect}
      onSurvival={() => game.setMode("survival")}
      onBack={() => game.setMode("menu")}
    />
  );
}

export function SurvivalScreen({ game }: { game: GameState }) {
  return <SurvivalMenu onBack={() => game.setMode("new-game")} />;
}

export function VehicleSelectScreen({ game }: { game: GameState }) {
  return (
    <VehicleSelectMenu
      loadout={game.playerLoadout}
      onConfirm={game.confirmLoadout}
      onBack={() => game.setMode("mission-select")}
    />
  );
}

export function MainMenuScreen({
  game,
  subMode,
}: {
  game: GameState;
  subMode: "menu" | "settings";
}) {
  return (
    <GameMenu
      mode={subMode}
      canResume={game.hasActiveRound}
      onPlay={() => game.setMode("playing")}
      onNewGame={game.openNewGame}
      onHowToPlay={game.startTutorial}
      onOpenSettings={() => game.setMode("settings")}
      onBack={() => game.setMode("menu")}
    />
  );
}
