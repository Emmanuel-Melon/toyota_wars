// packages/models/src/weapons/components/dshk-mount.tsx
import { useEffect, useMemo } from "react";
import { CylinderGeometry, MeshStandardMaterial } from "three";
import type { MountProps } from "../types";
import {
  MountAccent,
  MountAmmoFeed,
  MountBasePlate,
  MountBody,
  MountDarkBox,
  MountRearGrips,
  useUnitBoxGeometry,
} from "./mount-shared";

export function DshkMount({ palette }: MountProps) {
  const unitBox = useUnitBoxGeometry();

  const geometries = useMemo(
    () => ({
      // Subtle taper from breech (0.042) to forward barrel (0.032)
      barrel: new CylinderGeometry(0.032, 0.042, 1.48, 12),
      collar: new CylinderGeometry(0.046, 0.046, 0.07, 12),
      muzzleBrake: new CylinderGeometry(0.052, 0.046, 0.16, 12),
    }),
    [],
  );

  const materials = useMemo(
    () => ({
      barrel: new MeshStandardMaterial({
        color: "#202020",
        roughness: 0.42,
        metalness: 0.72,
      }),
      collar: new MeshStandardMaterial({
        color: "#2b2b2b",
        roughness: 0.48,
        metalness: 0.65,
      }),
      muzzle: new MeshStandardMaterial({
        color: "#181818",
        roughness: 0.46,
        metalness: 0.7,
      }),
    }),
    [],
  );

  useEffect(() => {
    return () => {
      Object.values(geometries).forEach((g) => g.dispose());
      Object.values(materials).forEach((m) => m.dispose());
    };
  }, [geometries, materials]);

  return (
    <>
      <MountBasePlate size={[0.34, 0.1, 0.46]} />
      <MountAccent
        palette={palette}
        position={[0.27, -0.03, -0.04]}
        size={[0.2, 0.2, 0.26]}
      />
      <MountBody
        position={[0, 0, 0.45]}
        size={[0.18, 0.2, 0.7]}
        color="#2c2c2c"
        metalness={0.45}
      />
      {/* Trunnion / side cradle brackets */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.105, -0.02, 0.18]}
          scale={[0.03, 0.12, 0.18]}
          geometry={unitBox}
          material={materials.collar}
          castShadow
        />
      ))}
      {/* Tapered barrel */}
      <mesh
        position={[0, 0, 1.05]}
        rotation={[Math.PI / 2, 0, 0]}
        geometry={geometries.barrel}
        material={materials.barrel}
        castShadow
      />
      {/* Barrel retaining collar */}
      <mesh
        position={[0, 0, 0.84]}
        rotation={[Math.PI / 2, 0, 0]}
        geometry={geometries.collar}
        material={materials.collar}
        castShadow
      />
      {/* Muzzle brake */}
      <mesh
        position={[0, 0, 1.78]}
        rotation={[Math.PI / 2, 0, 0]}
        geometry={geometries.muzzleBrake}
        material={materials.muzzle}
        castShadow
      />
      <MountDarkBox position={[0, 0.15, 0.18]} size={[0.05, 0.08, 0.2]} />
      <MountRearGrips span={0.24} z={-0.42} armZ={-0.46} />
      <MountAmmoFeed from={[0.21, 0.01, 0.12]} to={[0.08, 0.03, 0.16]} links={4} />
    </>
  );
}