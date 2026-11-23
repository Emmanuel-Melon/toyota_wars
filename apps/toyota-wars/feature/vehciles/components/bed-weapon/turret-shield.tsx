// apps/toyota-wars/feature/vehciles/bed-weapon/turret-shield.tsx
import type { WeaponMountKind } from "@/lib/weapons/weapon.types";
import type { VehiclePalette } from "../vehicle";

type Props = { mount: WeaponMountKind; palette: VehiclePalette };

/** Side plates + top bar that flank the gun. Skipped for rocket pod. */
export function TurretShield({ mount, palette }: Props) {
  if (mount === "rocketPod") return null;

  const isAuto = mount === "autocannon";
  const sideX = isAuto ? 0.34 : 0.26;
  const sideY = isAuto ? 0.4 : 0.32;
  const sideW = isAuto ? 0.4 : 0.3;
  const sideH = isAuto ? 0.7 : 0.5;
  const topY = isAuto ? 0.82 : 0.64;
  const topW = isAuto ? 1.08 : 0.82;

  return (
    <>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * sideX, sideY, 0.4]} castShadow>
          <boxGeometry args={[sideW, sideH, 0.05]} />
          <meshStandardMaterial color={palette.cabin} roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, topY, 0.4]} castShadow>
        <boxGeometry args={[topW, 0.16, 0.05]} />
        <meshStandardMaterial color={palette.cabin} roughness={0.8} />
      </mesh>
    </>
  );
}
