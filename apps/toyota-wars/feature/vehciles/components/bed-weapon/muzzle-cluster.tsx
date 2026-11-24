import { WeaponEffects } from "@/feature/vehciles/components/weapon-effects";
import type { WeaponMuzzleEmitter } from "@/lib/weapons/weapon.types";

export function MuzzleCluster({
  muzzleZ,
  muzzleOffsets,
}: {
  muzzleZ: number;
  muzzleOffsets: readonly WeaponMuzzleEmitter[];
}) {
  return (
    <>
      {muzzleOffsets.map((offset, index) => (
        <group key={index} position={[offset.right, offset.up ?? 0, muzzleZ]}>
          <WeaponEffects light={index === 0} />
        </group>
      ))}
    </>
  );
}
