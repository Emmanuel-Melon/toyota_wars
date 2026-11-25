"use client";

import { useCombat } from "@/context/combat-context";
import { usePlayer } from "@/context/player-context";
import { AmmoCounter } from "@/feature/combat/components/ammo-counter";
import layout from "@/feature/hud/components/hud-layout.module.css";
import { HudPanel } from "@/feature/hud/components/hud-parts";

export function VehicleStatusPanel({ compact = false }: { compact?: boolean }) {
  const { stats, maxAmmo } = useCombat();
  const { playerWeapon } = usePlayer();

  return (
    <HudPanel
      className={`pointer-events-none ${compact ? layout.mobileVehiclePanel : layout.desktopVehiclePanel}`}
      aria-label="Vehicle status"
    >
      <AmmoCounter
        current={stats.currentAmmo}
        capacity={maxAmmo}
        label={playerWeapon.label}
        compact={compact}
      />
    </HudPanel>
  );
}
