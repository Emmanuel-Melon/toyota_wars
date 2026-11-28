// packages/models/src/vehicle/components/pickup/pickup-cab.tsx
"use client";

import { useEffect, useMemo } from "react";
import { MeshStandardMaterial, BackSide } from "three";
import type { PickupCabProps } from "../../types";
import { PICKUP, PICKUP_CUTAWAY } from "../../config/vehicle-visual.config";
import { createCabGeometry } from "../../geometry/pickup";
import { sliceGeometryBelowY } from "../../geometry/slice";
import { Box } from "../primitives";
import { PickupCabInterior } from "./pickup-cab-interior";

const { cutY, frontZ, rearZ } = PICKUP_CUTAWAY;
const railX = PICKUP.width / 2 - 0.04;
const railLen = frontZ - rearZ;
const railMidZ = (frontZ + rearZ) / 2;

export function PickupCab({
  materials,
  doors,
  windows,
  extra,
  cutaway = true,
}: PickupCabProps) {
  const cab = useMemo(() => {
    const full = createCabGeometry();
    if (!cutaway) return full;
    const cut = sliceGeometryBelowY(full, cutY);
    full.dispose();
    return cut;
  }, [cutaway]);

  const innerMat = useMemo(
    () => new MeshStandardMaterial({ color: "#2b2a25", roughness: 0.9, side: BackSide }),
    [],
  );

  useEffect(() => () => cab.dispose(), [cab]);
  useEffect(() => () => innerMat.dispose(), [innerMat]);

  return (
    <>
      <mesh geometry={cab} material={materials.paint} castShadow />
      {cutaway && <mesh geometry={cab} material={innerMat} />}

      {cutaway ? (
        <>
          {/* Cut-edge rails: gives the sliced shell visible thickness */}
          {[-1, 1].map((side) => (
            <Box
              key={side}
              p={[side * railX, cutY + 0.012, railMidZ]}
              s={[0.06, 0.03, railLen]}
              m={materials.trim}
              shadow={false}
            />
          ))}
          <Box
            p={[0, cutY + 0.012, rearZ + 0.03]}
            s={[railX * 2, 0.03, 0.06]}
            m={materials.trim}
            shadow={false}
          />
          <PickupCabInterior materials={materials} />
        </>
      ) : (
        <>
          <Box p={[0, 1.17, -0.1]} s={[1.83, 0.36, 0.1]} m={materials.paint} />
          {windows}
        </>
      )}

      {doors}

      {[-1, 1].map((side) => (
        <group key={side}>
          {/* Mirror stalk & angled housing */}
          <Box p={[side * 0.96, 1.02, 0.72]} s={[0.14, 0.035, 0.035]} m={materials.dark} />
          <Box p={[side * 1.06, 1.04, 0.71]} s={[0.075, 0.18, 0.14]} m={materials.paint} />
          <Box
            p={[side * 1.095, 1.04, 0.71]}
            s={[0.012, 0.15, 0.11]}
            m={materials.glass}
            shadow={false}
          />
          {/* Side rocker / running board */}
          <Box p={[side * 0.955, 0.04, 0.1]} s={[0.07, 0.05, 1.5]} m={materials.dark} />
        </group>
      ))}

      {/* Roof marker / visor bar: gone with the roof */}
      {!cutaway && (
        <>
          <Box p={[0, 1.58, 0.12]} s={[1.1, 0.07, 0.16]} m={materials.dark} />
          <Box p={[0, 1.58, 0.205]} s={[1.0, 0.04, 0.01]} m={materials.glass} shadow={false} />
        </>
      )}
      {extra}
    </>
  );
}

export const PICKUP_CAB_WIDTH = PICKUP.width;