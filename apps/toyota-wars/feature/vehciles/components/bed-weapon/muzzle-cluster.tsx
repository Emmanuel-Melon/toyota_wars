import type { RefObject } from "react";
import type * as THREE from "three";
import { WeaponEffects } from "@/feature/vehciles/components/weapon-effects";
import type { WeaponMuzzleEmitter } from "@/lib/weapons/weapon.types";

type MuzzleOffset = WeaponMuzzleEmitter;

type Props = {
  muzzleRef?: RefObject<THREE.Object3D | null>;
  muzzleZ: number;
  muzzleOffsets: readonly MuzzleOffset[];
  /** Wraps the cluster in an extra rotation group (used for rocketPod). */
  rotation?: [number, number, number];
};

export function MuzzleCluster({
  muzzleRef,
  muzzleZ,
  muzzleOffsets,
  rotation,
}: Props) {
  const cluster = (
    <>
      <group ref={muzzleRef} position={[0, 0, muzzleZ]} />
      {muzzleOffsets.map((offset, index) => (
        <group key={index} position={[offset.right, offset.up ?? 0, muzzleZ]}>
          <WeaponEffects light={index === 0} />
        </group>
      ))}
    </>
  );

  return rotation ? <group rotation={rotation}>{cluster}</group> : cluster;
}
