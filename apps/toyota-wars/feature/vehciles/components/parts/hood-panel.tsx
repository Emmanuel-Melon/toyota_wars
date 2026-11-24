"use client";

import { useMemo } from "react";
import type * as THREE from "three";
import { Vehicle } from "@toyota/models";
import { useVehicleContext } from "@/context/vehicle-context";
import { COMBAT_CONFIG } from "@/lib/combat/combat.config";
import { partHealthRatio } from "@/lib/combat/combat.parts";
import { vehicleNumberForUnitId } from "@/lib/vehicle-identity";
import { FallenPart } from "./fallen-part";

export function HoodPanel({ paintMat }: { paintMat: THREE.Material }) {
  const { health, maxHealth, partHealth, team, unitId } = useVehicleContext();
  const vehicleNumber = vehicleNumberForUnitId(unitId);
  const numberTexture = useMemo(
    () => Vehicle.getVehicleNumberTexture(vehicleNumber),
    [vehicleNumber],
  );

  const partRatio = partHealthRatio(partHealth?.hood, "hood", maxHealth);
  const totalRatio = Math.max(0, Math.min(1, health / maxHealth));
  const threshold = COMBAT_CONFIG.PLAYER_DAMAGE_SMOKE_HEALTH_FRACTION;
  const thresholdDamage =
    totalRatio <= threshold
      ? 0.35 + 0.65 * ((threshold - totalRatio) / threshold)
      : 0;
  const damage = Math.min(1, Math.max(1 - partRatio, thresholdDamage));

  return (
    <FallenPart
      part="hood"
      position={[0, 0, 0]}
      drop={1.7}
      spin={[0.5, 0.9, 1.3]}
      debris="hood"
      debrisColor="#4a4238"
      scatter={0.3}
    >
      <Vehicle.HoodPanelVisual
        paintMat={paintMat}
        damage={damage}
        numberTexture={numberTexture}
        numberColor={team === "ally" ? "#20261d" : "#d9d5c2"}
      />
    </FallenPart>
  );
}
