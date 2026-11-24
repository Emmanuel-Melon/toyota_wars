"use client";

import { useEffect, useMemo } from "react";
import type { PickupShellProps } from "../../types";
import {
  ARCH_CY,
  BEVEL,
  FRONT_AXLE_Z,
  PICKUP,
  REAR_AXLE_Z,
} from "../../config/vehicle-visual.config";
import { createFlareGeometry } from "../../geometry/pickup";
import { Box, Cyl } from "../primitives";

const width = PICKUP.width;
const frontZ = PICKUP.frontZ + BEVEL;
const axles = [FRONT_AXLE_Z, REAR_AXLE_Z];

export function PickupShell({ materials, children }: PickupShellProps) {
  const flare = useMemo(createFlareGeometry, []);
  useEffect(() => () => flare.dispose(), [flare]);

  return (
    <>
      <Box
        p={[0, 0.34, frontZ + 0.015]}
        s={[1.0, 0.2, 0.03]}
        m={materials.dark}
      />
      <Box
        p={[0, 0.34, frontZ + 0.035]}
        s={[1.1, 0.03, 0.02]}
        m={materials.chrome}
      />
      {[-1, 1].map((side) => (
        <Box
          key={side}
          p={[side * 0.66, 0.45, frontZ + 0.01]}
          s={[0.32, 0.13, 0.04]}
          m={materials.headlight}
          shadow={false}
        />
      ))}
      <Box
        p={[0, 0.06, frontZ + 0.12]}
        s={[width + 0.06, 0.2, 0.2]}
        m={materials.trim}
      />
      <Box
        p={[0, 0.08, frontZ + 0.225]}
        s={[0.3, 0.14, 0.01]}
        m={materials.chrome}
        shadow={false}
      />

      {axles.flatMap((z) =>
        [-1, 1].map((side) => (
          <mesh
            key={`${z}:${side}`}
            geometry={flare}
            material={materials.dark}
            position={[side * (width / 2 + 0.01), ARCH_CY, z]}
          />
        )),
      )}

      {children}

      <Box
        p={[0, 0.2, -1.75]}
        s={[1.4, 0.3, 1.7]}
        m={materials.dark}
        shadow={false}
      />
      {[-1, 1].map((side) => (
        <Box
          key={side}
          p={[side * 0.55, 0.06, 0]}
          s={[0.1, 0.14, 4.9]}
          m={materials.dark}
          shadow={false}
        />
      ))}
      {axles.map((z) => (
        <group key={z}>
          <Box
            p={[0, ARCH_CY, z]}
            s={[width - 0.15, 0.09, 0.09]}
            m={materials.dark}
            shadow={false}
          />
          <mesh position={[0, ARCH_CY, z]} material={materials.dark}>
            <sphereGeometry args={[0.13, 12, 8]} />
          </mesh>
        </group>
      ))}
      {[-1, 1].map((side) => (
        <Box
          key={side}
          p={[side * 0.55, ARCH_CY + 0.1, REAR_AXLE_Z]}
          s={[0.07, 0.05, 0.9]}
          m={materials.dark}
          shadow={false}
        />
      ))}
      <Cyl
        p={[0.42, 0, -1.6]}
        r={0.04}
        len={2.1}
        m={materials.dark}
        rot={[Math.PI / 2, 0, 0]}
      />
    </>
  );
}
