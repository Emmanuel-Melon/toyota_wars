// apps/toyota-wars/feature/effects/vehicle-destroyed-bridge.tsx
"use client";

import { useEffect } from "react";
import { useBattle } from "@/context/battle-context";
import { useCombat } from "@/context/combat-context";
import { useFx } from "@/context/fx-context";
import { COMBAT_CONFIG } from "@/lib/combat/combat.config";

export function VehicleDestroyedFxBridge() {
  const { events } = useCombat();
  const { registry } = useBattle();
  const fx = useFx();

  useEffect(() => {
    const offUnit = events.on("unitDestroyed", (event) => {
      const unit = registry.get(event.unitId);
      if (!unit) return;
      fx.emit("vehicleDestroyed", {
        position: unit.position.clone(),
        unitId: event.unitId,
        team: event.victimTeam ?? "enemy",
      });
    });
    const offPlayer = events.on("playerDestroyed", () => {
      const unit = registry.get(COMBAT_CONFIG.PLAYER_ID);
      if (!unit) return;
      fx.emit("vehicleDestroyed", {
        position: unit.position.clone(),
        unitId: COMBAT_CONFIG.PLAYER_ID,
        team: "ally",
      });
    });

    return () => {
      offUnit();
      offPlayer();
    };
  }, [events, fx, registry]);

  return null;
}
