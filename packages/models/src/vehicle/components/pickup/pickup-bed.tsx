// packages/models/src/vehicle/components/pickup/pickup-bed.tsx
"use client";

import { useEffect, useMemo } from "react";
import { MeshStandardMaterial } from "three";
import type { PickupBedProps } from "../../types";
import { PICKUP } from "../../config/vehicle-visual.config";
import { createBedSideGeometry } from "../../geometry/pickup";
import { Box, Cyl } from "../primitives";

const bedCenterZ = (PICKUP.cabRearZ + PICKUP.rearZ) / 2;
const bedLength = PICKUP.cabRearZ - PICKUP.rearZ - 0.1;
const width = PICKUP.width;

const plateMat = new MeshStandardMaterial({ color: "#bdb9a8", roughness: 0.6 });

const FLOOR_RIBS_X = [-0.6, -0.3, 0, 0.3, 0.6] as const;
const CAN_ZS = [-2.05, -1.77] as const;
const CAN_X = -0.76;

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

      {/* Floor with raised ribs */}
      <Box
        p={[0, PICKUP.bedFloorY - 0.04, bedCenterZ]}
        s={[width - 0.12, 0.08, bedLength]}
        m={materials.dark}
      />
      {FLOOR_RIBS_X.map((x) => (
        <Box
          key={x}
          p={[x, PICKUP.bedFloorY + 0.006, bedCenterZ]}
          s={[0.04, 0.012, bedLength - 0.2]}
          m={materials.trim}
          shadow={false}
        />
      ))}

      {/* Tailgate: panel, stamped ribs, chrome handle */}
      <Box
        p={[0, 0.72, PICKUP.rearZ + 0.04]}
        s={[width - 0.14, 0.46, 0.06]}
        m={materials.paint}
      />
      {[0.6, 0.86].map((y) => (
        <Box
          key={y}
          p={[0, y, PICKUP.rearZ + 0.005]}
          s={[width - 0.34, 0.02, 0.012]}
          m={materials.dark}
          shadow={false}
        />
      ))}
      <Box
        p={[0, 0.78, PICKUP.rearZ + 0.005]}
        s={[0.25, 0.05, 0.03]}
        m={materials.chrome}
        shadow={false}
      />

      {/* Taillights with bezels */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <Box
            p={[side * 0.88, 0.8, PICKUP.rearZ]}
            s={[0.1, 0.24, 0.03]}
            m={materials.dark}
            shadow={false}
          />
          <Box
            p={[side * 0.88, 0.8, PICKUP.rearZ - 0.015]}
            s={[0.08, 0.2, 0.04]}
            m={materials.taillight}
            shadow={false}
          />
        </group>
      ))}

      {/* Rear bumper, plate, tow hooks */}
      <Box
        p={[0, 0.06, PICKUP.rearZ - 0.12]}
        s={[width, 0.18, 0.2]}
        m={materials.trim}
      />
      <Box
        p={[0, 0.06, PICKUP.rearZ - 0.225]}
        s={[0.3, 0.11, 0.01]}
        m={plateMat}
        shadow={false}
      />
      {[-1, 1].map((side) => (
        <Box
          key={side}
          p={[side * 0.7, 0, PICKUP.rearZ - 0.26]}
          s={[0.06, 0.05, 0.08]}
          m={materials.dark}
        />
      ))}

      {/* Crates, with straps */}
      <Box p={[-0.45, 0.62, -2.35]} s={[0.4, 0.24, 0.34]} m={materials.cabin} />
      <Box p={[0.1, 0.62, -2.4]} s={[0.4, 0.24, 0.34]} m={materials.cabin} />
      <Box p={[0.55, 0.66, -2.4]} s={[0.26, 0.32, 0.12]} m={materials.trim} />
      <Box p={[-0.45, 0.62, -2.35]} s={[0.05, 0.25, 0.36]} m={materials.trim} />
      <Box p={[0.1, 0.62, -2.4]} s={[0.05, 0.25, 0.36]} m={materials.trim} />

      {/* Jerry cans against the left wall */}
      {CAN_ZS.map((z) => (
        <group key={z}>
          <Box p={[CAN_X, 0.67, z]} s={[0.14, 0.34, 0.26]} m={materials.cabin} />
          <Box
            p={[CAN_X, 0.86, z]}
            s={[0.1, 0.05, 0.14]}
            m={materials.dark}
            shadow={false}
          />
          <Cyl
            p={[CAN_X, 0.865, z + 0.09]}
            r={0.025}
            len={0.06}
            m={materials.dark}
          />
        </group>
      ))}

      {/* Roll hoops */}
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