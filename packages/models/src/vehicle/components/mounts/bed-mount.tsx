// packages/models/src/vehicle/components/mounts/bed-mount.tsx
import { useEffect, useMemo } from "react";
import { CylinderGeometry, MeshStandardMaterial } from "three";
import type { BedMountProps, V3 } from "../../types";
import { MuzzleAnchor } from "./muzzle-anchor";
import { Pedestal } from "./pedestal";
import { TurretShield } from "./turret-shield";

const ROCKET_POD_ROTATION: V3 = [-0.18, 0, 0];

export function BedMount({
  palette,
  mount,
  yawRef,
  pitchRef,
  slideRef,
  muzzleRef,
  muzzleZ,
  weapon,
  gunner,
  effects,
}: BedMountProps) {
  const ringGeometry = useMemo(
    () => new CylinderGeometry(0.18, 0.18, 0.07, 14),
    [],
  );

  const ringMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: palette.accent,
        roughness: 0.6,
      }),
    [palette.accent],
  );

  useEffect(() => {
    return () => {
      ringGeometry.dispose();
    };
  }, [ringGeometry]);

  useEffect(() => {
    return () => {
      ringMaterial.dispose();
    };
  }, [ringMaterial]);

  return (
    <>
      <Pedestal />

      <group ref={yawRef} position={[0, 0.78, 0]}>
        <mesh
          geometry={ringGeometry}
          material={ringMaterial}
          castShadow
        />

        <TurretShield mount={mount} palette={palette} />

        <group ref={pitchRef} position={[0, 0.42, 0.15]}>
          <group ref={slideRef}>{weapon}</group>
          {gunner}
          <MuzzleAnchor
            muzzleRef={muzzleRef}
            muzzleZ={muzzleZ}
            rotation={mount === "rocketPod" ? ROCKET_POD_ROTATION : undefined}
          >
            {effects}
          </MuzzleAnchor>
        </group>
      </group>
    </>
  );
}