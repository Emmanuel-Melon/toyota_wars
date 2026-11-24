// packages/models/src/weapons/components/zu23-mount.tsx
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

export function Zu23Pedals() {
  const unitBox = useUnitBoxGeometry();

  const geometries = useMemo(
    () => ({
      bar: new CylinderGeometry(0.022, 0.022, 0.36, 10),
    }),
    [],
  );

  const materials = useMemo(
    () => ({
      bar: new MeshStandardMaterial({
        color: "#1b1b1b",
        metalness: 0.78,
        roughness: 0.38,
      }),
      arm: new MeshStandardMaterial({
        color: "#262626",
        metalness: 0.55,
        roughness: 0.55,
      }),
      pad: new MeshStandardMaterial({
        color: "#1a1a18",
        metalness: 0.1,
        roughness: 0.9,
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
    <group position={[0, -0.25, -0.2]}>
      <mesh
        position={[0, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        geometry={geometries.bar}
        material={materials.bar}
        castShadow
      />

      {[-1, 1].map((side) => (
        <group
          key={side}
          position={[side * 0.12, -0.05, 0.05]}
          rotation={[0.3, 0, 0]}
        >
          <mesh
            position={[0, 0.06, -0.05]}
            scale={[0.03, 0.12, 0.03]}
            geometry={unitBox}
            material={materials.arm}
            castShadow
          />
          <mesh
            position={[0, 0, 0]}
            scale={[0.08, 0.03, 0.08]}
            geometry={unitBox}
            material={materials.pad}
            castShadow
            receiveShadow
          />
        </group>
      ))}
    </group>
  );
}

export function Zu23Mount({ palette }: MountProps) {
  const unitBox = useUnitBoxGeometry();

  const geometries = useMemo(
    () => ({
      // Subtle taper from receiver to muzzle on twin 23mm barrels
      barrel: new CylinderGeometry(0.044, 0.062, 1.38, 12),
      collar: new CylinderGeometry(0.068, 0.068, 0.08, 12),
      flashHider: new CylinderGeometry(0.076, 0.066, 0.18, 12),
    }),
    [],
  );

  const materials = useMemo(
    () => ({
      barrel: new MeshStandardMaterial({
        color: "#1e1e1e",
        roughness: 0.38,
        metalness: 0.75,
      }),
      collar: new MeshStandardMaterial({
        color: "#2c2c2c",
        roughness: 0.48,
        metalness: 0.65,
      }),
      flashHider: new MeshStandardMaterial({
        color: "#151515",
        roughness: 0.45,
        metalness: 0.68,
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
      <MountBasePlate size={[0.38, 0.12, 0.45]} />
      <MountAccent
        palette={palette}
        position={[0.26, -0.04, 0]}
        size={[0.18, 0.22, 0.3]}
      />
      <MountBody
        position={[0, 0, 0.12]}
        size={[0.32, 0.3, 0.82]}
        color="#2a2a2a"
        metalness={0.45}
      />
      {/* Bridge strut tying twin barrels together */}
      <mesh
        position={[0, 0.02, 1.15]}
        scale={[0.28, 0.035, 0.07]}
        geometry={unitBox}
        material={materials.collar}
        castShadow
      />
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh
            position={[side * 0.11, 0, 0.94]}
            rotation={[Math.PI / 2, 0, 0]}
            geometry={geometries.barrel}
            material={materials.barrel}
            castShadow
          />
          <mesh
            position={[side * 0.11, 0, 0.62]}
            rotation={[Math.PI / 2, 0, 0]}
            geometry={geometries.collar}
            material={materials.collar}
            castShadow
          />
          <mesh
            position={[side * 0.11, 0, 1.68]}
            rotation={[Math.PI / 2, 0, 0]}
            geometry={geometries.flashHider}
            material={materials.flashHider}
            castShadow
          />
        </group>
      ))}
      <MountDarkBox position={[0, 0.2, 0.08]} size={[0.05, 0.09, 0.18]} />
      <MountRearGrips span={0.32} z={-0.45} armZ={-0.5} />
      <Zu23Pedals />
      <MountAmmoFeed from={[0.21, 0.02, 0.06]} to={[0.14, 0.04, 0.12]} links={4} />
    </>
  );
}