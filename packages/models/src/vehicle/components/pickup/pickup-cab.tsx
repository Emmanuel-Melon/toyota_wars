// packages/models/src/vehicle/components/pickup/pickup-cab.tsx
"use client";

import { useEffect, useMemo } from "react";
import type { PickupCabProps } from "../../types";
import { PICKUP } from "../../config/vehicle-visual.config";
import { createCabGeometry } from "../../geometry/pickup";
import { Box } from "../primitives";

export function PickupCab({
  materials,
  doors,
  windows,
  extra,
}: PickupCabProps) {
  const cab = useMemo(createCabGeometry, []);
  useEffect(() => () => cab.dispose(), [cab]);

  return (
    <>
      <mesh geometry={cab} material={materials.paint} castShadow />

      <Box p={[0, 1.17, -0.1]} s={[1.83, 0.36, 0.1]} m={materials.paint} />
      {windows}
      {doors}

      {[-1, 1].map((side) => (
        <group key={side}>
          {/* Mirror stalk & angled housing */}
          <Box
            p={[side * 0.96, 1.02, 0.72]}
            s={[0.14, 0.035, 0.035]}
            m={materials.dark}
          />
          <Box
            p={[side * 1.06, 1.04, 0.71]}
            s={[0.075, 0.18, 0.14]}
            m={materials.paint}
          />
          <Box
            p={[side * 1.095, 1.04, 0.71]}
            s={[0.012, 0.15, 0.11]}
            m={materials.glass}
            shadow={false}
          />
          {/* Side rocker / running board */}
          <Box
            p={[side * 0.955, 0.04, 0.1]}
            s={[0.07, 0.05, 1.5]}
            m={materials.dark}
          />
        </group>
      ))}

      {/* Roof marker / visor bar */}
      <Box p={[0, 1.58, 0.12]} s={[1.1, 0.07, 0.16]} m={materials.dark} />
      <Box
        p={[0, 1.58, 0.205]}
        s={[1.0, 0.04, 0.01]}
        m={materials.glass}
        shadow={false}
      />
      {extra}
    </>
  );
}

export const PICKUP_CAB_WIDTH = PICKUP.width;