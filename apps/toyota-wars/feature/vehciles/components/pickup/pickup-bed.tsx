// apps/toyota-wars/feature/vehciles/components/pickup/pickup-bed.tsx
"use client";

import { Box, Cyl } from "./pickup-primitives";
import { PICKUP } from "@/feature/vehciles/pickup.geometry";
import * as THREE from "three";

const W = PICKUP.width;
const bedCz = (PICKUP.cabRearZ + PICKUP.rearZ) / 2;
const bedLen = PICKUP.cabRearZ - PICKUP.rearZ - 0.1;

export function PickupBed({
  bedSide,
  m,
}: {
  bedSide: THREE.BufferGeometry;
  m: any;
}) {
  return (
    <>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          geometry={bedSide}
          material={m.paint}
          position={[side * (W / 2 - 0.035), 0, 0]}
          castShadow
        />
      ))}

      {/* Bed Base & Tailgate */}
      <Box
        p={[0, PICKUP.bedFloorY - 0.04, bedCz]}
        s={[W - 0.12, 0.08, bedLen]}
        m={m.dark}
      />
      <Box
        p={[0, 0.72, PICKUP.rearZ + 0.04]}
        s={[W - 0.14, 0.46, 0.06]}
        m={m.paint}
      />
      <Box
        p={[0, 0.78, PICKUP.rearZ + 0.005]}
        s={[0.25, 0.05, 0.03]}
        m={m.chrome}
        shadow={false}
      />

      {[-1, 1].map((side) => (
        <Box
          key={side}
          p={[side * 0.88, 0.8, PICKUP.rearZ - 0.015]}
          s={[0.08, 0.2, 0.04]}
          m={m.taillight}
          shadow={false}
        />
      ))}
      <Box p={[0, 0.06, PICKUP.rearZ - 0.12]} s={[W, 0.18, 0.2]} m={m.trim} />

      {/* Cargo */}
      <Box p={[-0.45, 0.62, -2.35]} s={[0.4, 0.24, 0.34]} m={m.cabin} />
      <Box p={[0.1, 0.62, -2.4]} s={[0.4, 0.24, 0.34]} m={m.cabin} />
      <Box p={[0.55, 0.66, -2.4]} s={[0.26, 0.32, 0.12]} m={m.trim} />

      {/* Roll hoop */}
      {[-1, 1].map((side) => (
        <Cyl
          key={side}
          p={[side * 0.78, 1.05, -1.02]}
          r={0.03}
          len={1.1}
          m={m.dark}
        />
      ))}
      <Cyl
        p={[0, 1.6, -1.02]}
        r={0.03}
        len={1.56}
        m={m.dark}
        rot={[0, 0, Math.PI / 2]}
      />
    </>
  );
}
