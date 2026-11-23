import { useMission } from "@/context/missions.context";
import { GameOverMenu } from "@/feature/menu/components/game-menu";
import { useMissionSession } from "@/feature/missions/components/mission-session";
import type { Team } from "@/lib/combat/combat.types";
import { getNextMission } from "@/lib/missions/missions.progression";
import type { GameState } from "../game.types";
import { MissionResultMenu } from "../../missions/components/mission-overlay";

export function MissionResultScreen({ game }: { game: GameState }) {
  const { retryMission, returnToSkirmish, startMission } = useMissionSession();
  const { mission, result } = useMission();
  const nextMission =
    result?.outcome === "success" && mission ? getNextMission(mission) : null;

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
