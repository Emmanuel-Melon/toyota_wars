// apps/toyota-wars/feature/vehciles/components/vehicle.tsx
"use client";

import { useRef, type ReactNode } from "react";
import type * as THREE from "three";
import { VehicleBody } from "./vehicle-body";
import { BedWeapon } from "./bed-weapon";
import { Wheels } from "./wheels/wheels";
import {
  useVehicleContext,
  type VehiclePartHealth,
} from "../../../context/vehicle-context";
import { hashUnitId } from "@/feature/vehciles/hooks/use-wreck-visual";
import { useVehicleEffects } from "@/feature/vehciles/hooks/use-vehicle-effects";

export type { VehiclePalette } from "@/lib/palettes";
export type { VehiclePartHealth } from "../../../context/vehicle-context";

type VehicleProps = {
  position?: [number, number, number];
  rotationY?: number;
  scale?: number;
  showHealthBar?: boolean;
  children?: ReactNode;
};

export function Vehicle({
  position = [0, 0, 0],
  rotationY = 0,
  scale = 1,
  showHealthBar = true,
  children,
}: VehicleProps) {
  const {
    unitId,
    palette,
    model,
    health,
    maxHealth,
    partHealth,
    wrecked,
    destructionActive,
    vehicleRef,
    muzzleRef,
    aimTargetRef,
    motionRef,
    recoilRef,
  } = useVehicleContext();
  const bodyRef = useRef<THREE.Group>(null);

  useVehicleEffects({
    bodyRef,
    vehicleRef,
    muzzleRef,
    recoilRef,
    motionRef,
    maxHealth,
    partHealth,
    model,
    destructionActive,
    destructionSeed: hashUnitId(unitId),
  });

  const bodyPalette = wrecked
    ? { ...palette, body: "#4a4238", accent: "#1d1b18", cabin: "#2a2620" }
    : palette;

  return (
    <group
      ref={vehicleRef}
      position={position}
      rotation={[0, rotationY, 0]}
      scale={scale}
    >
      {/* unsprung: stays glued to the ground */}
      {motionRef && <Wheels motionRef={motionRef} />}

      {/* sprung: rocks on its "suspension" when firing */}
      <group ref={bodyRef}>
        <VehicleBody
          model={model}
          palette={bodyPalette}
          health={wrecked ? 0 : (partHealth?.body ?? health)}
          maxHealth={maxHealth}
          showHealthBar={showHealthBar && !wrecked}
          wrecked={wrecked}
          seed={hashUnitId(`${unitId}:paint`)}
        />
        {!wrecked && (
          <BedWeapon
            palette={palette}
            health={partHealth?.turret ?? health}
            maxHealth={maxHealth}
            muzzleRef={muzzleRef}
            aimTargetRef={aimTargetRef}
          />
        )}
      </group>

      {!wrecked && children}
    </group>
  );
}
