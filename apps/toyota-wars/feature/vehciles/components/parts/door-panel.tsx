"use client";

import { useMemo } from "react";
import { PICKUP } from "@/feature/vehciles/pickup.geometry";
import { getVehicleNumberTexture } from "@/feature/vehciles/vehicle-number.texture";
import { vehicleNumberForUnitId } from "@/lib/vehicle-identity";
import { useVehicleContext } from "../../../../context/vehicle-context";
import { FallenPart } from "./fallen-part";
import { dropToGround } from "./helpers";
import type { DoorPanelProps } from "./types";

const DOOR_Y = 0.76;

/** A detachable door with paint, chrome handle, and a dark shut-line. */
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
      <mesh material={paintMat} castShadow>
        <boxGeometry args={[0.045, 0.48, 0.86]} />
      </mesh>
      {showNumber && (
        <mesh
          position={[side * 0.03, -0.06, -0.2]}
          rotation={[0, (side * Math.PI) / 2, 0]}
        >
          <planeGeometry args={[0.3, 0.16]} />
          <meshBasicMaterial
            map={numberTexture}
            color={team === "ally" ? "#20261d" : "#d9d5c2"}
            transparent
            alphaTest={0.08}
            depthWrite={false}
            polygonOffset
            polygonOffsetFactor={-2}
            toneMapped={false}
          />
        </mesh>
      )}
      <mesh position={[side * 0.03, 0.17, 0]} material={chromeMat}>
        <boxGeometry args={[0.02, 0.03, 0.16]} />
      </mesh>
      <mesh position={[side * 0.025, 0, 0]} material={darkMat}>
        <boxGeometry args={[0.012, 0.44, 0.012]} />
      </mesh>
    </FallenPart>
  );
}
