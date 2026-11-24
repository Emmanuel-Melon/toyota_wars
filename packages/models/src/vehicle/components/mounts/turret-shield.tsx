import type { VehiclePalette, WeaponMountKind } from "../../types";

type TurretShieldProps = {
  mount: WeaponMountKind;
  palette: VehiclePalette;
};

export function TurretShield({ mount, palette }: TurretShieldProps) {
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
