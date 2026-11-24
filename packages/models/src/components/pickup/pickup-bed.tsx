"use client";

import { useEffect, useMemo } from "react";
import type { PickupBedProps } from "../../types";
import { PICKUP } from "../../config/vehicle-visual.config";
import { createBedSideGeometry } from "../../geometry/pickup";
import { Box, Cyl } from "../primitives";

const bedCenterZ = (PICKUP.cabRearZ + PICKUP.rearZ) / 2;
const bedLength = PICKUP.cabRearZ - PICKUP.rearZ - 0.1;
const width = PICKUP.width;

export function PickupBed({ materials }: PickupBedProps) {
  const bedSide = useMemo(createBedSideGeometry, []);
  useEffect(() => () => bedSide.dispose(), [bedSide]);

  return (
    <>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          geometry={bedSide}
          material={materials.paint}
          position={[side * (width / 2 - 0.035), 0, 0]}
          castShadow
        />
      ))}

      <Box
        p={[0, PICKUP.bedFloorY - 0.04, bedCenterZ]}
        s={[width - 0.12, 0.08, bedLength]}
        m={materials.dark}
      />
      <Box
        p={[0, 0.72, PICKUP.rearZ + 0.04]}
        s={[width - 0.14, 0.46, 0.06]}
        m={materials.paint}
      />
      <Box
        p={[0, 0.78, PICKUP.rearZ + 0.005]}
        s={[0.25, 0.05, 0.03]}
        m={materials.chrome}
        shadow={false}
      />

      {[-1, 1].map((side) => (
        <Box
          key={side}
          p={[side * 0.88, 0.8, PICKUP.rearZ - 0.015]}
          s={[0.08, 0.2, 0.04]}
          m={materials.taillight}
          shadow={false}
        />
      ))}
      <Box
        p={[0, 0.06, PICKUP.rearZ - 0.12]}
        s={[width, 0.18, 0.2]}
        m={materials.trim}
      />

      <Box p={[-0.45, 0.62, -2.35]} s={[0.4, 0.24, 0.34]} m={materials.cabin} />
      <Box p={[0.1, 0.62, -2.4]} s={[0.4, 0.24, 0.34]} m={materials.cabin} />
      <Box p={[0.55, 0.66, -2.4]} s={[0.26, 0.32, 0.12]} m={materials.trim} />

      {[-1, 1].map((side) => (
        <Cyl
          key={side}
          p={[side * 0.78, 1.05, -1.02]}
          r={0.03}
          len={1.1}
          m={materials.dark}
        />
      ))}
      <Cyl
        p={[0, 1.6, -1.02]}
        r={0.03}
        len={1.56}
        m={materials.dark}
        rot={[0, 0, Math.PI / 2]}
      />
    </>
  );
}
