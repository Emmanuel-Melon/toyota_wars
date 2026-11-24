"use client";

import { useMemo, useRef } from "react";
import type * as THREE from "three";
import { BedMount, CrewGunner, MOUNT_MUZZLE_Z } from "@toyota/models";
import {
  createTurretAimLimits,
  BASE_TURRET_LIMITS,
} from "@/lib/aim/aim.config";
import { DEFAULT_MUZZLES } from "@/lib/weapons/weapon.config";
import { useVehicleContext } from "@/context/vehicle-context";
import { VEHICLE_MODELS } from "@/lib/vehicles/vehicle.config";
import type { BedWeaponProps } from "./types";
import { useTurretAim } from "../../hooks/use-turret-aim";
import { MuzzleCluster } from "./muzzle-cluster";
import { WeaponMount } from "@/feature/weapons/components/mounts";
import { TankPart } from "../tank-part";

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
      barPosition={[0, 1.95, 0]}
      showHealthBar={false}
    >
      <BedMount
        palette={palette}
        mount={mount}
        yawRef={yawRef}
        pitchRef={pitchRef}
        slideRef={slideRef}
        muzzleRef={muzzleRef}
        muzzleZ={muzzleZ}
        weapon={<WeaponMount kind={mount} palette={palette} />}
        gunner={mount !== "rocketPod" ? <CrewGunner /> : null}
        effects={
          <MuzzleCluster muzzleZ={muzzleZ} muzzleOffsets={muzzleOffsets} />
        }
      />
    </TankPart>
  );
}
