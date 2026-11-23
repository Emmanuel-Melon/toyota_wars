"use client";

import { useCombat } from "@/context/combat-context";
import { usePlayer } from "@/context/player-context";
import layout from "@/feature/hud/components/hud-layout.module.css";
import { HudPanel } from "@/feature/hud/components/hud-parts";
import { COMBAT_CONFIG } from "@/lib/combat/combat.config";
import { PART_CATALOG, partHealthRatio } from "@/lib/combat/combat.parts";
import type { VehiclePart } from "@/lib/combat/combat.teams";
import { cn } from "@/lib/utils";

const PART_GROUPS: readonly { label: string; parts: readonly VehiclePart[] }[] =
  [
    {
      label: "WHEELS",
      parts: ["wheelFL", "wheelFR", "wheelRL", "wheelRR"],
    },
    {
      label: "DOORS",
      parts: ["doorFL", "doorFR", "doorRL", "doorRR"],
    },
    {
      label: "GLASS",
      parts: [
        "windshield",
        "windowFL",
        "windowFR",
        "windowRL",
        "windowRR",
        "windowRear",
      ],
    },
    { label: "HOOD", parts: ["hood"] },
    { label: "WEAPON", parts: ["turret"] },
  ];

const CHIP_STYLES = {
  ok: "bg-[#7fbf7a] shadow-[0_0_4px_rgba(127,191,122,0.4)]",
  damaged: "bg-gold shadow-[0_0_4px_rgba(255,210,122,0.5)]",
  destroyed: "bg-[#c0392b] shadow-none",
} as const;

export function PlayerHealthBar({ compact = false }: { compact?: boolean }) {
  const { health } = useCombat();
  const { playerPartHealth } = usePlayer();
  const value =
    health[COMBAT_CONFIG.PLAYER_ID] ?? COMBAT_CONFIG.PLAYER_MAX_HEALTH;
  const percent = Math.max(
    0,
    Math.min(100, (value / COMBAT_CONFIG.PLAYER_MAX_HEALTH) * 100),
  );

  return (
    <HudPanel
      className={`pointer-events-none ${compact ? layout.mobileHealth : layout.desktopHealth}`}
      aria-label="Player health"
    >
      <div className="mb-[6px] flex justify-between font-mono text-[10px] font-semibold uppercase leading-[1.2] tracking-[0.16em] opacity-80">
        <span>HULL</span>
        <span>
          {Math.ceil(value)} / {COMBAT_CONFIG.PLAYER_MAX_HEALTH}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-[3px] bg-white/20">
        <div
          className="h-full rounded-[inherit] bg-gradient-to-r from-[#c0392b] to-gold shadow-[0_0_10px_rgba(255,210,122,0.35)] transition-[width] duration-100 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      {!compact && (
        <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
          {PART_GROUPS.map((group) => (
            <div
              className="flex items-center justify-between gap-1.5"
              key={group.label}
            >
              <span className="font-mono text-[8px] font-semibold uppercase leading-[1.2] tracking-[0.12em] opacity-70">
                {group.label}
              </span>
              <span className="flex gap-0.5">
                {group.parts.map((part) => {
                  const ratio = partHealthRatio(
                    playerPartHealth[part],
                    part,
                    COMBAT_CONFIG.PLAYER_MAX_HEALTH,
                  );
                  const state =
                    ratio <= 0 ? "destroyed" : ratio < 1 ? "damaged" : "ok";
                  return (
                    <span
                      key={part}
                      className={cn(
                        "h-1 w-[10px] rounded-[1px]",
                        CHIP_STYLES[state],
                      )}
                      title={`${PART_CATALOG[part].label} · ${Math.round(ratio * 100)}%`}
                    />
                  );
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </HudPanel>
  );
}
