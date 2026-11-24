"use client";

import { useGameFrame } from "@/render-loop";
import { COMBAT_CONFIG } from "@/lib/combat/combat.config";
import {
  partHealthRatio,
  projectPartHealth,
  VEHICLE_PARTS,
} from "@/lib/combat/combat.parts";
import { WRECK_LOOT } from "@/lib/combat/wreck.registry";
import { useBattle } from "@/context/battle-context";
import { useCombat } from "@/context/combat-context";
import { usePlayer } from "@/context/player-context";

export function WreckPickupSystem() {
  const { wrecks } = useBattle();
  const { health, partHealth, roster } = useCombat();
  const { playerBody, playerAmmo, refillAmmo, playerControlsLocked } =
    usePlayer();
  const playerHealth =
    health[COMBAT_CONFIG.PLAYER_ID] ?? COMBAT_CONFIG.PLAYER_MAX_HEALTH;
  const projectedParts = projectPartHealth(
    partHealth,
    COMBAT_CONFIG.PLAYER_ID,
    COMBAT_CONFIG.PLAYER_MAX_HEALTH,
  );
  const healthUseful =
    playerHealth < COMBAT_CONFIG.PLAYER_MAX_HEALTH ||
    VEHICLE_PARTS.some(
      (part) =>
        partHealthRatio(
          projectedParts[part],
          part,
          COMBAT_CONFIG.PLAYER_MAX_HEALTH,
        ) < 1,
    );

  useGameFrame(() => {
    if (playerControlsLocked) return;

    const wreck = wrecks.findNear(
      playerBody.position,
      COMBAT_CONFIG.WRECK_PICKUP_RADIUS,
      "enemy",
      (candidate) => {
        if (!candidate.loot) return false;
        return candidate.loot.type === WRECK_LOOT.AMMO
          ? playerAmmo.current < COMBAT_CONFIG.MAX_AMMO
          : healthUseful;
      },
    );
    if (!wreck?.loot) return;

    if (wreck.loot.type === WRECK_LOOT.AMMO) {
      if (refillAmmo(wreck.loot.amount) > 0) {
        wrecks.collect(wreck);
      }
      return;
    }

    if (roster.healUnit(COMBAT_CONFIG.PLAYER_ID, wreck.loot.amount) > 0) {
      wrecks.collect(wreck);
    }
  }, "postSimSync");

  return null;
}
