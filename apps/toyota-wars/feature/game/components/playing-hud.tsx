"use client";

import type { RefObject } from "react";
import { useCameraMode } from "@/context/camera-mode-context";
import { useViewport } from "@/context/viewport-context";
import { DroneRoamOverlay } from "@/feature/camera/components/drone-roam-overlay";
import { isRoamMode } from "@/feature/camera/camera.types";
import { CombatTelemetry } from "@/feature/combat/components/combat-telemetry";
import { DangerVignette } from "@/feature/combat/components/danger-vignette";
import { DamageIndicatorHud } from "@/feature/combat/components/damage-indicator-hud";
import { FormationControls } from "@/feature/combat/components/formation-controls";
import { PlayerHealthBar } from "@/feature/combat/components/player-health-bar";
import { TacticalControls } from "@/feature/combat/components/tactical-controls";
import type { GameState } from "@/feature/game/game.types";
import { TacticalDrawer } from "@/feature/game/components/tactical-drawer";
import { MissionMinimap } from "@/feature/missions/components/mission-minimap";
import { MissionHud } from "@/feature/missions/components/mission-overlay";
import { SceneReticle } from "@/feature/scene/components/scene-reticle";
import { Speedometer } from "@/feature/vehciles/components/speedometer";
import { VehicleStatusPanel } from "@/feature/vehciles/components/vehicle-status-panel";
import layout from "@/feature/hud/components/hud-layout.module.css";
import {
  CollapsibleHudPanel,
  HudPanel,
} from "@/feature/hud/components/hud-parts";

type Props = { game: GameState; shellRef: RefObject<HTMLElement | null> };

export function PlayingHud({ game, shellRef }: Props) {
  const { isMobile } = useViewport();
  const { mode } = useCameraMode();

  if (isRoamMode(mode)) return <DroneRoamOverlay />;

  return (
    <>
      <DangerVignette />
      {isMobile ? (
        <>
          <MissionHud compact />
          <HudPanel
            className={layout.mobileTelemetry}
            aria-label="Combat stats"
          >
            <CombatTelemetry compact />
          </HudPanel>
          <PlayerHealthBar compact />
          <Speedometer compact />
          <VehicleStatusPanel compact />
          <TacticalDrawer game={game} />
        </>
      ) : (
        <>
          <MissionHud />
          <div className={layout.desktopMapCluster}>
            <div className={layout.desktopMap}>
              <MissionMinimap />
            </div>
            <Speedometer />
          </div>
          <HudPanel
            className={layout.desktopStatsPanel}
            aria-label="Combat stats"
          >
            <CombatTelemetry />
          </HudPanel>
          <CollapsibleHudPanel
            title="FORMATION"
            className={`${layout.desktopFormationPanel} pointer-events-auto`}
            aria-label="Formation controls"
          >
            <FormationControls hideLabel />
          </CollapsibleHudPanel>
          <CollapsibleHudPanel
            title="SQUAD ORDERS"
            className={`${layout.desktopOrdersPanel} pointer-events-auto`}
            aria-label="Squad controls"
          >
            <TacticalControls />
          </CollapsibleHudPanel>
          <PlayerHealthBar />
          <VehicleStatusPanel />
        </>
      )}
      <DamageIndicatorHud />
      <SceneReticle containerRef={shellRef} />
    </>
  );
}
