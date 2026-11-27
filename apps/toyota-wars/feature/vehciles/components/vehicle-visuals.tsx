// apps/toyota-wars/feature/vehciles/components/vehicle-visuals.tsx
"use client";

import React from "react";
import {
  RigidBody,
  RapierRigidBody,
  CuboidCollider,
} from "@react-three/rapier";

import type * as THREE from "three";
import {
  Vehicle,
  type VehiclePalette,
  type VehiclePartHealth,
} from "./vehicle";
import type { VehicleMotion } from "@/feature/vehciles/vehicles.utils";
import type { Team, WeaponConfig } from "@toyota/combat";
import type {
  VehicleModelId,
  VehiclePlatformId,
} from "@/lib/vehicles/vehicle.types";
import { VEHICLE_MODELS } from "@/lib/vehicles/vehicle.config";
import { VehicleProvider } from "@/context/vehicle-context";
import type { RecoilRef } from "@/feature/vehciles/hooks/use-wreck-visual";
import { useWreckVisual } from "@/feature/vehciles/hooks/use-wreck-visual";

type VehicleVisualsProps = {
  unitId: string;
  team: Team;
  palette: VehiclePalette;
  model: VehicleModelId;
  platform: VehiclePlatformId;
  weapon: WeaponConfig;
  initialPosition: [number, number];
  initialY: number;
  initialRotationY: number;
  wreckPosition?: [number, number, number];
  wreckRotationY?: number;
  health: number;
  maxHealth: number;
  partHealth?: VehiclePartHealth;
  destroyed: boolean;
  rigidBodyRef: React.RefObject<RapierRigidBody | null>;
  visualRef: React.RefObject<THREE.Group | null>;
  muzzleRef: React.RefObject<THREE.Object3D | null>;
  recoilRef?: RecoilRef;
  aimTargetRef: React.RefObject<THREE.Vector3 | null>;
  aimAlignedRef?: React.RefObject<boolean>;
  motionRef: React.RefObject<VehicleMotion>;
  children?: React.ReactNode;
};

export function VehicleVisuals({
  unitId,
  team,
  palette,
  model,
  platform,
  weapon,
  initialPosition,
  initialY,
  initialRotationY,
  wreckPosition,
  wreckRotationY,
  health,
  maxHealth,
  partHealth,
  destroyed,
  rigidBodyRef,
  visualRef,
  muzzleRef,
  recoilRef,
  aimTargetRef,
  aimAlignedRef,
  motionRef,
  children,
}: VehicleVisualsProps) {
  const wrecked = useWreckVisual(destroyed);
  const collider = VEHICLE_MODELS[model].frame.colliderHalfExtents;

  if (destroyed) {
    const position: [number, number, number] = wreckPosition ?? [
      initialPosition[0],
      initialY,
      initialPosition[1],
    ];

    return (
      <>
        <VehicleProvider
          value={{
            unitId,
            team,
            palette,
            model,
            platform,
            weapon,
            health: 0,
            maxHealth,
            partHealth,
            wrecked,
            destructionActive: true,
            vehicleRef: visualRef,
            muzzleRef,
            recoilRef,
            aimTargetRef,
            aimAlignedRef,
            motionRef,
          }}
        >
          <Vehicle
            position={position}
            rotationY={wreckRotationY ?? initialRotationY}
          />
        </VehicleProvider>
      </>
    );
  }

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={[initialPosition[0], initialY, initialPosition[1]]}
      rotation={[0, initialRotationY, 0]}
      type="kinematicPosition"
      lockRotations
    >
      <CuboidCollider args={collider} />
      <VehicleProvider
        value={{
          unitId,
          team,
          palette,
          model,
          platform,
          weapon,
          health,
          maxHealth,
          partHealth,
          wrecked: false,
          vehicleRef: visualRef,
          muzzleRef,
          recoilRef,
          aimTargetRef,
          aimAlignedRef,
          motionRef,
        }}
      >
        <Vehicle>{children}</Vehicle>
      </VehicleProvider>
    </RigidBody>
  );
}
