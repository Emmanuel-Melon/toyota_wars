"use client";

import { CombatTelemetry } from "@/feature/combat/components/combat-telemetry";
import { FormationControls } from "@/feature/combat/components/formation-controls";
import { TacticalControls } from "@/feature/combat/components/tactical-controls";
import layout from "@/feature/hud/components/hud-layout.module.css";
import { HudPanel } from "@/feature/hud/components/hud-parts";

export function CombatStats() {
  return (
    <>
      <HudPanel className={layout.desktopStatsPanel} aria-label="Combat stats">
        <CombatTelemetry showLoadout />
        <FormationControls />
      </HudPanel>
      <HudPanel
        className={layout.desktopOrdersPanel}
        aria-label="Squad controls"
      >
        <TacticalControls />
      </HudPanel>
    </>
  );
}
