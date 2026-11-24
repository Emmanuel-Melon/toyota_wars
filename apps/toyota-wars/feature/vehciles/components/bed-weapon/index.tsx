"use client";

import { useMemo, useRef } from "react";
import type * as THREE from "three";
import {
  createTurretAimLimits,
  BASE_TURRET_LIMITS,
} from "@/lib/aim/aim.config";
import { DEFAULT_MUZZLES } from "@/lib/weapons/weapon.config";
import { useVehicleContext } from "@/context/vehicle-context";
import { CrewGunner } from "../gunner/crew-gunner";
import { VEHICLE_MODELS } from "@/lib/vehicles/vehicle.config";
import type { BedWeaponProps } from "./types";
import { MOUNT_MUZZLE_Z } from "./constants";
import { useTurretAim } from "../../hooks/use-turret-aim";
import { Pedestal } from "./pedestal";
import { TurretShield } from "./turret-shield";
import { MuzzleCluster } from "./muzzle-cluster";
import { WeaponMount } from "@/feature/weapons/components/mounts";
import { TankPart } from "../tank-part";

// apps/toyota-wars/feature/vehciles/bed-weapon/index.tsx
export function BedWeapon({
  palette,
  health,
  maxHealth,
  muzzleRef,
  aimTargetRef,
}: BedWeaponProps) {
  const yawRef = useRef<THREE.Group>(null);
  const pitchRef = useRef<THREE.Group>(null);
  const slideRef = useRef<THREE.Group>(null);

  const { weapon, model } = useVehicleContext();
  const mount = weapon?.visual.mount ?? "autocannon";
  const muzzleZ = MOUNT_MUZZLE_Z[mount];
  const muzzleOffsets = weapon?.muzzles ?? DEFAULT_MUZZLES;
  const disabled = health <= 0;
  const aimLimits = useMemo(
    () => (weapon ? createTurretAimLimits(weapon) : BASE_TURRET_LIMITS),
    [weapon],
  );

  useTurretAim({
    yawRef,
    pitchRef,
    slideRef,
    mount,
    disabled,
    aimLimits,
    muzzleRef,
    aimTargetRef,
  });

  return (
    <TankPart
      position={VEHICLE_MODELS[model].frame.mountPosition}
      health={health}
      maxHealth={maxHealth}
      barColor={palette.accent}
      barPosition={[0, 1.95, 0]} // Raised health bar to match new height
      showHealthBar={false}
    >
      <Pedestal />

      {/* Raised yaw pivot: increased Y from 0.5 to 0.78 so it clears the truck body */}
      <group ref={yawRef} position={[0, 0.78, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.07, 14]} />
          <meshStandardMaterial color={palette.accent} roughness={0.6} />
        </mesh>

        <TurretShield mount={mount} palette={palette} />

        {/* Pitch pivot: raised Y and shifted Z slightly forward */}
        <group ref={pitchRef} position={[0, 0.42, 0.15]}>
          <group ref={slideRef}>
            <WeaponMount kind={mount} palette={palette} />
          </group>

          {mount !== "rocketPod" && <CrewGunner />}

          {mount === "rocketPod" ? (
            <MuzzleCluster
              muzzleRef={muzzleRef}
              muzzleZ={muzzleZ}
              muzzleOffsets={muzzleOffsets}
              rotation={[-0.18, 0, 0]}
            />
          ) : (
            <MuzzleCluster
              muzzleRef={muzzleRef}
              muzzleZ={muzzleZ}
              muzzleOffsets={muzzleOffsets}
            />
          )}
        </group>
      </group>
    </TankPart>
  );
}
