// packages/models/src/vehicle/components/mounts/pedestal.tsx
import { useEffect, useMemo } from "react";
import { CylinderGeometry, MeshStandardMaterial } from "three";

export function Pedestal() {
  const { baseGeometry, postGeometry, baseMaterial, postMaterial } = useMemo(
    () => ({
      baseGeometry: new CylinderGeometry(0.24, 0.26, 0.04, 14),
      postGeometry: new CylinderGeometry(0.08, 0.1, 0.5, 10),
      baseMaterial: new MeshStandardMaterial({
        color: "#1a1a1a",
        roughness: 0.9,
      }),
      postMaterial: new MeshStandardMaterial({
        color: "#222",
        roughness: 0.7,
        metalness: 0.3,
      }),
    }),
    [],
  );

  useEffect(() => {
    return () => {
      baseGeometry.dispose();
      postGeometry.dispose();
      baseMaterial.dispose();
      postMaterial.dispose();
    };
  }, [baseGeometry, postGeometry, baseMaterial, postMaterial]);

  return (
    <>
      <mesh
        position={[0, 0.02, 0]}
        geometry={baseGeometry}
        material={baseMaterial}
        castShadow
      />
      <mesh
        position={[0, 0.25, 0]}
        geometry={postGeometry}
        material={postMaterial}
        castShadow
      />
    </>
  );
}