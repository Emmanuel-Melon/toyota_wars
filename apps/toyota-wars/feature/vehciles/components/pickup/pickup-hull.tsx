// apps/toyota-wars/feature/vehciles/components/pickup/pickup-hull.tsx
"use client";

import { useEffect, useMemo } from "react";
import type { VehiclePalette } from "@/feature/vehciles/components/vehicle";
import { Box, Cyl } from "./pickup-primitives";
import { PickupCab } from "./pickup-cab";
import { PickupBed } from "./pickup-bed";
import { PlayerDamageSmokeFx } from "@/feature/effects/components/vehicle-damage-smoke.fx";
import {
  ARCH_CY,
  BEVEL,
  FRONT_AXLE_Z,
  PICKUP,
  REAR_AXLE_Z,
  createBedSideGeometry,
  createCabGeometry,
  createFlareGeometry,
} from "@/feature/vehciles/pickup.geometry";
import { usePickupMaterials } from "@/feature/vehciles/hooks/use-pickup-materials";
import { HoodPanel } from "../parts/hood-panel";
import { TankPart } from "../tank-part";

const W = PICKUP.width;

export function PickupHull({
  palette,
  health,
  maxHealth,
  showHealthBar = true,
  wrecked = false,
  seed,
}: {
  palette: VehiclePalette;
  health: number;
  maxHealth: number;
  showHealthBar?: boolean;
  wrecked?: boolean;
  seed: number;
}) {
  const m = usePickupMaterials(palette, wrecked, seed);

  const cab = useMemo(() => createCabGeometry(), []);
  const bedSide = useMemo(() => createBedSideGeometry(), []);
  const flare = useMemo(() => createFlareGeometry(), []);

  useEffect(
    () => () => {
      cab.dispose();
      bedSide.dispose();
      flare.dispose();
    },
    [cab, bedSide, flare],
  );

  const frontZ = PICKUP.frontZ + BEVEL;
  const axles = [FRONT_AXLE_Z, REAR_AXLE_Z];

  return (
    <TankPart
      position={[0, PICKUP.baseY, 0]}
      health={health}
      maxHealth={maxHealth}
      barColor={palette.body}
      barPosition={[0, 1.95, 0]}
      showHealthBar={showHealthBar}
    >
      {/* ── Shell & Cab ───────────────────────── */}
      <PickupCab
        cab={cab}
        glassMat={m.glass}
        crackMat={m.glassCrack}
        paintMat={m.paint}
        darkMat={m.dark}
        chromeMat={m.chrome}
      />

      <HoodPanel paintMat={m.paint} />
      <PlayerDamageSmokeFx />

      {/* ── Front End ─────────────────────────── */}
      <Box p={[0, 0.34, frontZ + 0.015]} s={[1.0, 0.2, 0.03]} m={m.dark} />
      <Box p={[0, 0.34, frontZ + 0.035]} s={[1.1, 0.03, 0.02]} m={m.chrome} />
      {[-1, 1].map((side) => (
        <Box
          key={side}
          p={[side * 0.66, 0.45, frontZ + 0.01]}
          s={[0.32, 0.13, 0.04]}
          m={m.headlight}
          shadow={false}
        />
      ))}
      <Box p={[0, 0.06, frontZ + 0.12]} s={[W + 0.06, 0.2, 0.2]} m={m.trim} />
      <Box
        p={[0, 0.08, frontZ + 0.225]}
        s={[0.3, 0.14, 0.01]}
        m={m.chrome}
        shadow={false}
      />

      {/* ── Fender Flares ─────────────────────── */}
      {axles.flatMap((z) =>
        [-1, 1].map((side) => (
          <mesh
            key={`${z}:${side}`}
            geometry={flare}
            material={m.dark}
            position={[side * (W / 2 + 0.01), ARCH_CY, z]}
          />
        )),
      )}

      {/* ── Bed & Cargo ───────────────────────── */}
      <PickupBed bedSide={bedSide} m={m} />

      {/* ── Underbody ─────────────────────────── */}
      <Box p={[0, 0.2, -1.75]} s={[1.4, 0.3, 1.7]} m={m.dark} shadow={false} />
      {[-1, 1].map((side) => (
        <Box
          key={side}
          p={[side * 0.55, 0.06, 0]}
          s={[0.1, 0.14, 4.9]}
          m={m.dark}
          shadow={false}
        />
      ))}
      {axles.map((z) => (
        <group key={z}>
          <Box
            p={[0, ARCH_CY, z]}
            s={[W - 0.15, 0.09, 0.09]}
            m={m.dark}
            shadow={false}
          />
          <mesh position={[0, ARCH_CY, z]} material={m.dark}>
            <sphereGeometry args={[0.13, 12, 8]} />
          </mesh>
        </group>
      ))}
      {[-1, 1].map((side) => (
        <Box
          key={side}
          p={[side * 0.55, ARCH_CY + 0.1, REAR_AXLE_Z]}
          s={[0.07, 0.05, 0.9]}
          m={m.dark}
          shadow={false}
        />
      ))}
      <Cyl
        p={[0.42, 0.0, -1.6]}
        r={0.04}
        len={2.1}
        m={m.dark}
        rot={[Math.PI / 2, 0, 0]}
      />
    </TankPart>
  );
}
