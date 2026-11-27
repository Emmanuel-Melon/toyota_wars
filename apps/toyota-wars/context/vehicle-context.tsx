// feature/vehicles/vehicle-context.tsx
"use client";

import { createContext, useContext, type RefObject } from "react";
import type * as THREE from "three";
import type {
  Team,
  VehiclePart,
  WeaponCelebrationSystem,
  WeaponConfig,
} from "@toyota/combat";
import type { VehiclePalette } from "@/lib/palettes";
import type {
  VehicleModelId,
  VehiclePlatformId,
} from "@/lib/vehicles/vehicle.types";
import type { RecoilRef } from "@/feature/vehciles/hooks/use-wreck-visual";

export type VehiclePartHealth = Partial<Record<VehiclePart, number>>;

export type VehicleMotion = {
  speed: number;
  steer: number;
};

export type VehicleContextValue = {
  unitId: string;
  team: Team;
  palette: VehiclePalette;
  model: VehicleModelId;
  platform?: VehiclePlatformId;
  weapon?: WeaponConfig;
  health: number;
  maxHealth: number;
  partHealth?: VehiclePartHealth;
  wrecked: boolean;
  destructionActive?: boolean;
  // Refs shared down the tree
  vehicleRef?: RefObject<THREE.Group | null>;
  muzzleRef?: RefObject<THREE.Object3D | null>;
  aimTargetRef?: RefObject<THREE.Vector3 | null>;
  aimAlignedRef?: RefObject<boolean>;
  celebrationRef?: RefObject<WeaponCelebrationSystem>;
  motionRef?: RefObject<VehicleMotion>;
  /** Barrel/vehicle recoil state; absent on vehicles without recoil effects. */
  recoilRef?: RecoilRef;
};

const VehicleContext = createContext<VehicleContextValue | null>(null);

export function VehicleProvider({
  value,
  children,
}: {
  value: VehicleContextValue;
  children: React.ReactNode;
}) {
  return (
    <VehicleContext.Provider value={value}>{children}</VehicleContext.Provider>
  );
}

export function useVehicleContext() {
  const context = useContext(VehicleContext);
  if (!context) {
    throw new Error("useVehicleContext must be used within a VehicleProvider");
  }
  return context;
}
