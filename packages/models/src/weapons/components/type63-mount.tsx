// packages/models/src/weapons/components/type63-mount.tsx
import { useEffect, useMemo } from "react";
import { CylinderGeometry, MeshStandardMaterial } from "three";
import type { MountProps } from "../types";
import {
  MountAccent,
  MountBasePlate,
  MountBody,
  MountDarkBox,
  useUnitBoxGeometry,
} from "./mount-shared";

const TUBE_XS = [-0.27, -0.09, 0.09, 0.27];

export function Type63Mount({ palette }: MountProps) {
  const unitBox = useUnitBoxGeometry();

  const geometries = useMemo(
    () => ({
      tube: new CylinderGeometry(0.088, 0.094, 1.1, 12),
      frontRing: new CylinderGeometry(0.102, 0.098, 0.08, 12),
      rearCap: new CylinderGeometry(0.095, 0.095, 0.06, 12),
    }),
    [],
  );

  const materials = useMemo(
    () => ({
      tube: new MeshStandardMaterial({
        color: "#212121",
        roughness: 0.48,
        metalness: 0.62,
      }),
      ring: new MeshStandardMaterial({
        color: "#181818",
        roughness: 0.52,
        metalness: 0.55,
      }),
      frame: new MeshStandardMaterial({
        color: "#2b2b29",
        roughness: 0.65,
        metalness: 0.45,
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
      <MountBasePlate size={[0.66, 0.1, 0.52]} />
      <MountAccent
        palette={palette}
        position={[0, 0.03, -0.12]}
        size={[0.58, 0.28, 0.5]}
      />
      <group rotation={[-0.18, 0, 0]}>
        <MountBody
          position={[0, 0, 0.62]}
          size={[0.76, 0.38, 1.0]}
          color="#2a2a2a"
          metalness={0.4}
        />
        {/* Structural support struts binding the rocket bank */}
        {[-0.22, 0.22].map((yPos, idx) => (
          <mesh
            key={idx}
            position={[0, yPos, 1.18]}
            scale={[0.66, 0.035, 0.05]}
            geometry={unitBox}
            material={materials.frame}
            castShadow
          />
        ))}
        {TUBE_XS.map((x) => (
          <group key={x}>
            <mesh
              position={[x, 0, 1.0]}
              rotation={[Math.PI / 2, 0, 0]}
              geometry={geometries.tube}
              material={materials.tube}
              castShadow
            />
            <mesh
              position={[x, 0, 1.56]}
              rotation={[Math.PI / 2, 0, 0]}
              geometry={geometries.frontRing}
              material={materials.ring}
              castShadow
            />
            <mesh
              position={[x, 0, 0.44]}
              rotation={[Math.PI / 2, 0, 0]}
              geometry={geometries.rearCap}
              material={materials.ring}
              castShadow
            />
          </group>
        ))}
        <MountDarkBox position={[0, 0.28, 0.5]} size={[0.05, 0.16, 0.24]} />
        <MountDarkBox position={[0, 0.38, 0.55]} size={[0.28, 0.04, 0.04]} />
      </group>
    </>
  );
}