"use client";

import { useCombat } from "@/context/combat-context";
import layout from "@/feature/hud/components/hud-layout.module.css";
import { HudPanel } from "@/feature/hud/components/hud-parts";
import { COMBAT_CONFIG } from "@toyota/combat";
import { cn } from "@/lib/utils";

export function PlayerHealthBar({ compact = false }: { compact?: boolean }) {
  const { health } = useCombat();
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
      <div className="flex items-center gap-2">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className={cn(
            "shrink-0 text-gold",
            compact ? "h-3.5 w-3.5" : "h-4 w-4",
          )}
          aria-hidden="true"
        >
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
        <div
          role="progressbar"
          aria-label="Hull"
          aria-valuemin={0}
          aria-valuemax={COMBAT_CONFIG.PLAYER_MAX_HEALTH}
          aria-valuenow={Math.ceil(value)}
          className="h-1.5 flex-1 overflow-hidden rounded-[3px] bg-white/20"
        >
          <div
            className="h-full rounded-[inherit] bg-gradient-to-r from-[#c0392b] to-gold shadow-[0_0_10px_rgba(255,210,122,0.35)] transition-[width] duration-100 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </HudPanel>
  );
}
