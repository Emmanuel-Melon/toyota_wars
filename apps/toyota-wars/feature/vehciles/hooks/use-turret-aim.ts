// apps/toyota-wars/feature/vehciles/hooks/use-turret-aim.ts
import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import type * as THREE from "three";
import { applyTurretAim } from "@/lib/aim/aim.turret";
import { isMuzzleAimedAt } from "@/lib/aim/aim.muzzle";
import type { TurretAimLimits } from "@/lib/aim/aim.types";
import type { WeaponMountKind } from "@/lib/weapons/weapon.types";
import { useVehicleContext } from "../../../context/vehicle-context";
import {
  BARREL_KICK,
  MOUNT_PITCH_OFFSET,
} from "../components/bed-weapon/constants";

type Params = {
  yawRef: RefObject<THREE.Group | null>;
  pitchRef: RefObject<THREE.Group | null>;
  slideRef: RefObject<THREE.Group | null>;
  mount: WeaponMountKind;
  disabled: boolean;
  aimLimits: TurretAimLimits;
  muzzleRef?: RefObject<THREE.Object3D | null>;
  aimTargetRef?: RefObject<THREE.Vector3 | null>;
};

/** Drives turret yaw/pitch, celebration spin, recoil slide, and aim alignment. */
export function useTurretAim({
  yawRef,
  pitchRef,
  slideRef,
  mount,
  disabled,
  aimLimits,
  muzzleRef,
  aimTargetRef,
}: Params) {
  const wasCelebrating = useRef(false);
  const { vehicleRef, recoilRef, celebrationRef, aimAlignedRef } =
    useVehicleContext();

  useFrame((_, delta) => {
    const yaw = yawRef.current;
    const pitch = pitchRef.current;
    if (!yaw || !pitch) return;

    if (disabled) {
      pitch.rotation.x = 0.45;
      wasCelebrating.current = false;
      if (aimAlignedRef) aimAlignedRef.current = false;
      if (slideRef.current && recoilRef) slideRef.current.position.z = 0;
      return;
    }

    const celebration = celebrationRef?.current;
    if (celebration?.active) {
      if (aimAlignedRef) aimAlignedRef.current = false;
      if (!wasCelebrating.current) {
        celebration.setSpinAngle(yaw.rotation.y);
        wasCelebrating.current = true;
      }
      yaw.rotation.y = celebration.spinAngle;
      pitch.rotation.x +=
        (celebration.pitch - pitch.rotation.x) * Math.min(1, delta * 10);
      if (slideRef.current && recoilRef) {
        slideRef.current.position.z = -recoilRef.current.barrel * BARREL_KICK;
      }
      return;
    }

    wasCelebrating.current = false;
    applyTurretAim(
      yaw,
      pitch,
      vehicleRef?.current?.rotation.y ?? 0,
      aimTargetRef?.current ?? null,
      aimLimits,
      delta,
      recoilRef?.current.barrel ?? 0,
      MOUNT_PITCH_OFFSET[mount],
      muzzleRef?.current ?? null,
    );
    if (aimAlignedRef) {
      aimAlignedRef.current = isMuzzleAimedAt(
        muzzleRef?.current ?? null,
        aimTargetRef?.current ?? null,
      );
    }
    if (slideRef.current && recoilRef) {
      slideRef.current.position.z = -recoilRef.current.barrel * BARREL_KICK;
    }
  });
}
