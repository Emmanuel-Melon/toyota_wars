"use client";

import type { VehiclePalette } from "@/lib/palettes";
import type { VehicleModelId } from "@/lib/vehicles/vehicle.types";
import { Vehicle } from "@toyota/models";
import { PickupHull } from "../pickup/pickup-hull";

export type VehicleBodyProps = {
  model: VehicleModelId;
  palette: VehiclePalette;
  health: number;
  maxHealth: number;
  showHealthBar?: boolean;
  wrecked?: boolean;
  seed: number;
};

export function VehicleBody({
  model,
  wrecked = false,
  ...props
}: VehicleBodyProps) {
  return (
    <>
      <PickupHull {...props} wrecked={wrecked} />
      {model === "radar" && (
        <Vehicle.RadarDish palette={props.palette} wrecked={wrecked} />
      )}
    </>
  );
}
