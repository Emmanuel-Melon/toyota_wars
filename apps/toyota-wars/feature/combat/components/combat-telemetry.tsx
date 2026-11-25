"use client";

import { useCombat } from "@/context/combat-context";
import { cn } from "@/lib/utils";

export function CombatTelemetry({ compact = false }: { compact?: boolean }) {
  const { stats, livingAllies, livingEnemies } = useCombat();
  const { enemiesDestroyed } = stats;

  return (
    <div className="flex min-w-0 items-center">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          "shrink-0 text-ui-primary",
          compact ? "h-4 w-4" : "h-5 w-5",
        )}
        aria-hidden="true"
      >
        <rect x="7" y="3" width="10" height="18" rx="2" />
        <path d="M9 7h6" />
        <path d="M9 17h6" />
        <path d="M5 8v8" />
        <path d="M19 8v8" />
      </svg>
      <div
        role="group"
        aria-label={`${livingAllies} allies, ${livingEnemies} enemies, ${enemiesDestroyed} destroyed`}
        className={cn(
          "ml-2 flex min-w-0 flex-1 overflow-hidden rounded-[3px] border border-ui-secondary/30 bg-ui-panel/45 font-mono font-bold tabular-nums",
          compact ? "text-[12px]" : "text-[16px]",
        )}
      >
        <div className="flex basis-2/3 items-center justify-center gap-1.5 px-1 py-1">
          <span className="text-[#d27a38]">{livingAllies}</span>
          <span className="opacity-40">/</span>
          <span className="text-[#c0392b]">{livingEnemies}</span>
        </div>
        <div className="flex basis-1/3 items-center justify-center border-l border-ui-secondary/25 px-1 py-1 text-gold">
          {enemiesDestroyed}
        </div>
      </div>
    </div>
  );
}
