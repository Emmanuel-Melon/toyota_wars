"use client";

import { Vehicle } from "@toyota/models";
import type { VehiclePalette } from "@/lib/palettes";
import { PlayerDamageSmokeFx } from "@/feature/effects/components/vehicle-damage-smoke.fx";
import { PickupCab } from "./pickup-cab";
import { HoodPanel } from "../parts/hood-panel";
import { TankPart } from "../tank-part";

export function PickupHull({
  palette,
  health,
  maxHealth,
  showHealthBar = true,
  wrecked = false,
  seed,
}: {
  palette: VehiclePalette;
  health: number;
  maxHealth: number;
  showHealthBar?: boolean;
  wrecked?: boolean;
  seed: number;
}) {
  const materials = Vehicle.useVehicleMaterials(palette, wrecked, seed);

  return (
    <TankPart
      position={[0, Vehicle.PICKUP.baseY, 0]}
      health={health}
      maxHealth={maxHealth}
      barColor={palette.body}
      barPosition={[0, 1.95, 0]}
      showHealthBar={showHealthBar}
    >
      <PickupCab materials={materials} />
      <HoodPanel paintMat={materials.paint} />
      <PlayerDamageSmokeFx />
      <Vehicle.PickupShell materials={materials}>
        <Vehicle.PickupBed materials={materials} />
      </Vehicle.PickupShell>
    </TankPart>
  );
}
