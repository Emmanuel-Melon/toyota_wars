"use client";

import type { CSSProperties } from "react";
import { useCombat } from "@/context/combat-context";
import { COMBAT_CONFIG } from "@/lib/combat/combat.config";
import styles from "./danger-vignette.module.css";

export function DangerVignette() {
  const { health } = useCombat();
  const value =
    health[COMBAT_CONFIG.PLAYER_ID] ?? COMBAT_CONFIG.PLAYER_MAX_HEALTH;
  const ratio = Math.max(
    0,
    Math.min(1, value / COMBAT_CONFIG.PLAYER_MAX_HEALTH),
  );
  const threshold = COMBAT_CONFIG.PLAYER_DANGER_HEALTH_FRACTION;

  if (ratio > threshold) return null;

  const intensity =
    threshold <= 0
      ? 1
      : Math.min(1, Math.max(0, (threshold - ratio) / threshold));
  const style = {
    "--danger-inner-alpha": (0.08 + intensity * 0.22).toFixed(3),
    "--danger-edge-alpha": (0.22 + intensity * 0.5).toFixed(3),
    "--danger-pulse-duration": `${(1.6 - intensity * 0.9).toFixed(2)}s`,
  } as CSSProperties;

  return <div aria-hidden="true" className={styles.vignette} style={style} />;
}
