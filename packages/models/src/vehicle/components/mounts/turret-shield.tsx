// packages/models/src/vehicle/components/mounts/turret-shield.tsx
import { useEffect, useMemo } from "react";
import { BoxGeometry, MeshStandardMaterial } from "three";
import type { VehiclePalette, V3, WeaponMountKind } from "../../types";

type TurretShieldProps = {
  mount: WeaponMountKind;
  palette: VehiclePalette;
};

export function TurretShield({ mount, palette }: TurretShieldProps) {
  const isHidden = mount === "rocketPod";
  const isAuto = mount === "autocannon";

  const sideX = isAuto ? 0.34 : 0.26;
  const sideY = isAuto ? 0.4 : 0.32;
  const sideW = isAuto ? 0.4 : 0.3;
  const sideH = isAuto ? 0.7 : 0.5;
  const topY = isAuto ? 0.82 : 0.64;
  const topW = isAuto ? 1.08 : 0.82;

  const { leftPos, rightPos, topPos } = useMemo<{
    leftPos: V3;
    rightPos: V3;
    topPos: V3;
  }>(
    () => ({
      leftPos: [-sideX, sideY, 0.4],
      rightPos: [sideX, sideY, 0.4],
      topPos: [0, topY, 0.4],
    }),
    [sideX, sideY, topY],
  );

  const { sideGeometry, topGeometry } = useMemo(
    () => ({
      sideGeometry: new BoxGeometry(sideW, sideH, 0.05),
      topGeometry: new BoxGeometry(topW, 0.16, 0.05),
    }),
    [sideW, sideH, topW],
  );

  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: palette.cabin,
        roughness: 0.8,
      }),
    [palette.cabin],
  );

  useEffect(() => {
    return () => {
      sideGeometry.dispose();
      topGeometry.dispose();
    };
  }, [sideGeometry, topGeometry]);

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  if (isHidden) return null;

  return (
    <>
      <mesh
        position={leftPos}
        geometry={sideGeometry}
        material={material}
        castShadow
      />
      <mesh
        position={rightPos}
        geometry={sideGeometry}
        material={material}
        castShadow
      />
      <mesh
        position={topPos}
        geometry={topGeometry}
        material={material}
        castShadow
      />
    </>
  );
}