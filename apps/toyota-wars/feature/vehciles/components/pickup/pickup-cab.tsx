// apps/toyota-wars/feature/vehciles/components/pickup/pickup-cab.tsx
"use client";

import { Box } from "./pickup-primitives";
import type { VehiclePart } from "@/lib/combat/combat.teams";
import type * as THREE from "three";
import {
  WindshieldPanel,
  RearWindowPanel,
  SideGlassPanel,
  DoorPanel,
} from "../parts";

const DOORS: readonly { part: VehiclePart; side: number; z: number }[] = [
  { part: "doorFL", side: 1, z: 0.34 },
  { part: "doorFR", side: -1, z: 0.34 },
  { part: "doorRL", side: 1, z: -0.48 },
  { part: "doorRR", side: -1, z: -0.48 },
];

const SIDE_WINDOWS: readonly { part: VehiclePart; side: number; z: number }[] =
  [
    { part: "windowFL", side: 1, z: 0.34 },
    { part: "windowFR", side: -1, z: 0.34 },
    { part: "windowRL", side: 1, z: -0.48 },
    { part: "windowRR", side: -1, z: -0.48 },
  ];

type PickupCabProps = {
  cab: THREE.BufferGeometry;
  glassMat: THREE.Material;
  crackMat: THREE.Material;
  paintMat: THREE.Material;
  darkMat: THREE.Material;
  chromeMat: THREE.Material;
};

export function PickupCab({
  cab,
  glassMat,
  crackMat,
  paintMat,
  darkMat,
  chromeMat,
}: PickupCabProps) {
  return (
    <>
      <mesh geometry={cab} material={paintMat} castShadow />

      <Box p={[0, 1.17, -0.1]} s={[1.83, 0.36, 0.1]} m={paintMat} />
      <WindshieldPanel glassMat={glassMat} crackMat={crackMat} />
      <RearWindowPanel glassMat={glassMat} crackMat={crackMat} />
      {SIDE_WINDOWS.map(({ part, side, z }) => (
        <SideGlassPanel
          key={part}
          part={part}
          side={side}
          z={z}
          glassMat={glassMat}
          crackMat={crackMat}
        />
      ))}

      {DOORS.map(({ part, side, z }) => (
        <DoorPanel
          key={part}
          part={part}
          side={side}
          z={z}
          paintMat={paintMat}
          chromeMat={chromeMat}
          darkMat={darkMat}
        />
      ))}

      {[-1, 1].map((side) => (
        <group key={side}>
          <Box
            p={[side * 0.97, 1.02, 0.72]}
            s={[0.14, 0.04, 0.04]}
            m={darkMat}
          />
          <Box
            p={[side * 1.05, 1.04, 0.72]}
            s={[0.06, 0.17, 0.13]}
            m={paintMat}
          />
          <Box
            p={[side * 0.955, 0.04, 0.1]}
            s={[0.07, 0.05, 1.5]}
            m={darkMat}
          />
        </group>
      ))}

      <Box p={[0, 1.58, 0.12]} s={[1.1, 0.07, 0.16]} m={darkMat} />
      <Box
        p={[0, 1.58, 0.205]}
        s={[1.0, 0.04, 0.01]}
        m={glassMat}
        shadow={false}
      />
    </>
  );
}
