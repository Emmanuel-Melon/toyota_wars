"use client";

import { useCombat } from "@/context/combat-context";
import { usePlayer } from "@/context/player-context";
import { HudStatRow } from "@/feature/hud/components/hud-parts";
import layout from "@/feature/hud/components/hud-layout.module.css";

export function CombatTelemetry({
  compact = false,
  showLoadout = false,
}: {
  compact?: boolean;
  showLoadout?: boolean;
}) {
  const { stats, maxAmmo, livingAllies, livingEnemies } = useCombat();
  const { playerWeapon, playerVehicle } = usePlayer();
  const { enemiesDestroyed, currentAmmo } = stats;
  const ammoPercent = (currentAmmo / maxAmmo) * 100;
  const rowClass = compact ? layout.compactRow : undefined;

  return (
    <div className={compact ? layout.mobileTelemetryInner : undefined}>
      <div className="flex flex-col gap-1">
        <HudStatRow
          className={rowClass}
          label="ALLIES"
          value={livingAllies}
          tone="ally"
        />
        <HudStatRow
          className={rowClass}
          label="ENEMIES"
          value={livingEnemies}
          tone="enemy"
        />
        <HudStatRow
          className={rowClass}
          label="DESTROYED"
          value={enemiesDestroyed}
        />
      </div>
      {showLoadout && (
        <div className="flex flex-col gap-1">
          <HudStatRow label="WEAPON" value={playerWeapon.label} />
          <HudStatRow
            label="PLATFORM"
            value={`${playerVehicle.id.toUpperCase()} · FRONTLINE ${Math.round(playerVehicle.frontlineDurability * 100)}%`}
          />
        </div>
      )}
      <div className="flex flex-col gap-1">
        <HudStatRow className={rowClass} label="AMMO" value={currentAmmo} />
        <div className="h-1 w-full overflow-hidden rounded-[2px] bg-white/20">
          <div
            className="h-full bg-gold transition-[width] duration-100 ease-out"
            style={{ width: `${ammoPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
