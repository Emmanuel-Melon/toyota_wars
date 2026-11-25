"use client";

import type { RefObject } from "react";
import { useViewport } from "@/context/viewport-context";
import { CombatTelemetry } from "@/feature/combat/components/combat-telemetry";
import { CombatStats } from "@/feature/combat/components/combat-stats";
import { DangerVignette } from "@/feature/combat/components/danger-vignette";
import { DamageIndicatorHud } from "@/feature/combat/components/damage-indicator-hud";
import { PlayerHealthBar } from "@/feature/combat/components/player-health-bar";
import type { GameState } from "@/feature/game/game.types";
import { TacticalDrawer } from "@/feature/game/components/tactical-drawer";
import { MissionMinimap } from "@/feature/missions/components/mission-minimap";
import { MissionHud } from "@/feature/missions/components/mission-overlay";
import { SceneReticle } from "@/feature/scene/components/scene-reticle";
import { Speedometer } from "@/feature/vehciles/components/speedometer";
import layout from "@/feature/hud/components/hud-layout.module.css";
import { HudPanel } from "@/feature/hud/components/hud-parts";

type Props = { game: GameState; shellRef: RefObject<HTMLElement | null> };

export function PlayingHud({ game, shellRef }: Props) {
  const { isMobile } = useViewport();

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
          <TacticalDrawer game={game} />
        </>
      ) : (
        <>
          <MissionHud />
          <div className={layout.desktopMapColumn}>
            <MissionMinimap />
          </div>
          <CombatStats />
          <PlayerHealthBar />
          <Speedometer />
        </>
      )}
      <DamageIndicatorHud />
      <SceneReticle containerRef={shellRef} />
    </>
  );
}
