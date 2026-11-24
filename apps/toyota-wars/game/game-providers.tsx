"use client";

import type { ReactNode } from "react";
import { ArenaProvider } from "@/context/arena-context";
import { CameraModeProvider } from "@/context/camera-mode-context";
import { CameraLookProvider } from "@/feature/camera/camera-look.context";
import { CombatProvider, useCombat } from "@/context/combat-context";
import { useMission } from "@/context/missions.context";
import { PlayerProvider } from "@/context/player-context";
import { TargetsProvider } from "@/context/targets-context";
import type { GameMode } from "@/feature/game/game.types";
import { MissionSessionProvider } from "@/feature/missions/components/mission-session";
import { DEFAULT_PLAYER_LOADOUT } from "@/lib/vehicles/vehicle.config";
import type { VehicleLoadout } from "@/lib/vehicles/vehicle.types";

export function GameProviders({
  children,
  mode,
  loadout = DEFAULT_PLAYER_LOADOUT,
  graphicsReady,
  uiBlocked = false,
}: {
  children: ReactNode;
  mode: GameMode;
  loadout?: VehicleLoadout;
  graphicsReady: boolean;
  uiBlocked?: boolean;
}) {
  return (
    <ArenaProvider>
      <CombatProvider>
        <MissionSessionProvider>
          <CameraModeProvider>
            <GameRuntime
              mode={mode}
              loadout={loadout}
              graphicsReady={graphicsReady}
              uiBlocked={uiBlocked}
            >
              {children}
            </GameRuntime>
          </CameraModeProvider>
        </MissionSessionProvider>
      </CombatProvider>
    </ArenaProvider>
  );
}

function GameRuntime({
  children,
  mode,
  loadout,
  graphicsReady,
  uiBlocked,
}: {
  children: ReactNode;
  mode: GameMode;
  loadout: VehicleLoadout;
  graphicsReady: boolean;
  uiBlocked: boolean;
}) {
  const { winner } = useCombat();
  const { status } = useMission();
  const missionActive = status === "briefing" || status === "active";
  const missionFinished = status === "success" || status === "failed";
  const paused =
    !graphicsReady ||
    uiBlocked ||
    mode !== "playing" ||
    missionFinished ||
    (winner !== null && !missionActive);

  return (
    <TargetsProvider playerModel={loadout.model}>
      <PlayerProvider paused={paused} loadout={loadout}>
        <CameraLookProvider screenMode={mode}>{children}</CameraLookProvider>
      </PlayerProvider>
    </TargetsProvider>
  );
}
