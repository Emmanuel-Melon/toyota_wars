// packages/models/src/vehicle/components/pickup/pickup-cab-interior.tsx
"use client";

import { useEffect, useMemo } from "react";
import { MeshStandardMaterial } from "three";
import { PICKUP_CUTAWAY } from "../../config/vehicle-visual.config";
import type { PickupCabProps } from "../../types";
import { poses, Soldier } from "../../../soldier";
import { Box, Cyl } from "../primitives";

export type PickupMaterials = PickupCabProps["materials"];

const SEAT_X = [-0.4, 0.4] as const;
const PASSENGER_Y = 0.56;
const PASSENGER_Z = -0.22;
const { driverX, frontZ } = PICKUP_CUTAWAY;

export function PickupCabInterior({ materials }: { materials: PickupMaterials }) {
  const seatMaterial = useMemo(
    () => new MeshStandardMaterial({ color: "#b9a67f", roughness: 0.85 }),
    [],
  );

  useEffect(() => () => seatMaterial.dispose(), [seatMaterial]);

  return (
    <>
      {/* Floor and transmission tunnel */}
      <Box p={[0, 0.3, -0.3]} s={[1.7, 0.04, 1.9]} m={materials.dark} shadow={false} />
      <Box p={[0, 0.36, -0.2]} s={[0.22, 0.1, 1.2]} m={materials.dark} shadow={false} />

      {/* Seats: base + backrest + headrest */}
      {SEAT_X.map((x, index) => (
        <group key={x}>
          <Box p={[x, 0.44, -0.12]} s={[0.46, 0.14, 0.5]} m={seatMaterial} />
          <Box p={[x, 0.72, -0.4]} s={[0.46, 0.5, 0.12]} m={seatMaterial} />
          <Box p={[x, 1.02, -0.4]} s={[0.26, 0.12, 0.08]} m={seatMaterial} shadow={false} />
          <Soldier
            pose={index === 0 ? poses.seatedAiming : poses.seatedLoading}
            position={[x, PASSENGER_Y, PASSENGER_Z]}
            scale={0.9}
            loadout={{
              helmet: true,
              goggles: false,
              headset: false,
              vest: false,
              radio: false,
            }}
          />
        </group>
      ))}

      {/* Dash, cowl, instrument hood */}
      <Box p={[0, 0.82, frontZ - 0.1]} s={[1.75, 0.3, 0.32]} m={materials.dark} />
      <Box p={[driverX, 0.99, frontZ - 0.12]} s={[0.4, 0.08, 0.18]} m={materials.dark} shadow={false} />

      {/* Steering column + wheel */}
      <Cyl
        p={[driverX, 0.86, frontZ - 0.3]}
        r={0.02}
        len={0.3}
        m={materials.dark}
        rot={[Math.PI / 2.6, 0, 0]}
      />
      <mesh position={[driverX, 0.94, frontZ - 0.42]} rotation={[Math.PI / 2.6, 0, 0]}>
        <torusGeometry args={[0.16, 0.017, 8, 20]} />
        <meshStandardMaterial color="#1b1b18" roughness={0.8} />
      </mesh>

      {/* Gear lever */}
      <Cyl p={[0, 0.5, 0.2]} r={0.015} len={0.22} m={materials.chrome} />
    </>
  );
}
