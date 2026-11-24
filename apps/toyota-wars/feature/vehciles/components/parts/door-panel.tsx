"use client";

import { useMemo } from "react";
import {
  DoorPanelVisual,
  PICKUP,
  getVehicleNumberTexture,
} from "@toyota/models";
import { vehicleNumberForUnitId } from "@/lib/vehicle-identity";
import { useVehicleContext } from "../../../../context/vehicle-context";
import { FallenPart } from "./fallen-part";
import { dropToGround } from "./helpers";
import type { DoorPanelProps } from "./types";

const DOOR_Y = 0.76;

export function DoorPanel({
  part,
  side,
  z,
  paintMat,
  chromeMat,
  darkMat,
}: DoorPanelProps) {
  const { palette, team, unitId } = useVehicleContext();
  const x = side * (PICKUP.width / 2 + 0.025);
  const showNumber = part === "doorFL" || part === "doorFR";
  const vehicleNumber = vehicleNumberForUnitId(unitId);
  const numberTexture = useMemo(
    () => getVehicleNumberTexture(vehicleNumber),
    [vehicleNumber],
  );

  return (
    <FallenPart
      part={part}
      position={[x, DOOR_Y, z]}
      drop={dropToGround(DOOR_Y)}
      spin={[0.2, side * 0.9, side * 1.3]}
      debris="door"
      debrisColor={palette.body}
    >
      <DoorPanelVisual
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
