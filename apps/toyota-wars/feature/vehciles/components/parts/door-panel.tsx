"use client";

import { useMemo } from "react";
import { Vehicle } from "@toyota/models";
import { vehicleNumberForUnitId } from "@/lib/vehicle-identity";
import { useVehicleContext } from "../../../../context/vehicle-context";
import { FallenPart } from "./fallen-part";
import { dropToGround } from "./helpers";
import type { DoorPanelProps } from "./types";

export function DoorPanel({
  part,
  side,
  z,
  paintMat,
  chromeMat,
  darkMat,
}: DoorPanelProps) {
  const { palette, team, unitId } = useVehicleContext();
  const x = side * (Vehicle.PICKUP.width / 2 + Vehicle.PICKUP_DOOR.xOffset);
  const showNumber = part === "doorFL" || part === "doorFR";
  const vehicleNumber = vehicleNumberForUnitId(unitId);
  const numberTexture = useMemo(
    () => Vehicle.getVehicleNumberTexture(vehicleNumber),
    [vehicleNumber],
  );

  return (
    <FallenPart
      part={part}
      position={[x, Vehicle.PICKUP_DOOR.y, z]}
      drop={dropToGround(Vehicle.PICKUP_DOOR.y)}
      spin={[0.2, side * 0.9, side * 1.3]}
      debris="door"
      debrisColor={palette.body}
    >
      <Vehicle.DoorPanelVisual
        side={side}
        z={z}
        paintMat={paintMat}
        chromeMat={chromeMat}
        darkMat={darkMat}
        showNumber={showNumber}
        numberTexture={numberTexture}
        numberColor={team === "ally" ? "#20261d" : "#d9d5c2"}
      />
    </FallenPart>
  );
}
