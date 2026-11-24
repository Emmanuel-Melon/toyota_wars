import { useMission } from "@/context/missions.context";
import { GameOverMenu } from "@/feature/menu/components/game-menu";
import { useMissionSession } from "@/feature/missions/components/mission-session";
import type { Team } from "@/lib/combat/combat.types";
import { MISSIONS } from "@/lib/missions/missions.data";
import { getNextMission } from "@toyota/missions";
import type { GameState } from "../game.types";
import { MissionResultMenu } from "../../missions/components/mission-overlay";

export function MissionResultScreen({ game }: { game: GameState }) {
  const { retryMission, returnToSkirmish, startMission } = useMissionSession();
  const { mission, result } = useMission();
  const nextMission =
    result?.outcome === "success" && mission
      ? getNextMission(MISSIONS, mission)
      : null;

  return (
    <MissionResultMenu
      onRetry={() => {
        retryMission();
        game.setMode("playing");
      }}
      onNext={
        nextMission
          ? () => {
              startMission(nextMission);
              game.setMode("playing");
            }
          : undefined
      }
      onExit={() => {
        returnToSkirmish();
        game.clearPendingMission();
        game.setHasActiveRound(false);
        game.setMode("menu");
      }}
    />
  );
}

export function GameOverScreen({
  winner,
  game,
}: {
  winner: Team;
  game: GameState;
}) {
  return <GameOverMenu winner={winner} onReplay={game.openMissionSelect} />;
}
