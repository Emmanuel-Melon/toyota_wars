// packages/models/src/vehicle/components/gunner/gunner-torso.tsx
import { useEffect, useMemo } from "react";
import {
  BoxGeometry,
  CylinderGeometry,
  MeshStandardMaterial,
} from "three";
import type { ResolvedPalette, V3 } from "../../types";
import { SharedCrewMaterials, useCrewMaterials } from "../hooks/use-crew-materials";

type GunnerTorsoProps = {
  palette: ResolvedPalette;
  materials?: SharedCrewMaterials;
};

type ShoulderStrapSpec = {
  key: string;
  position: V3;
  rotation: V3;
};

const SHOULDER_STRAPS: ShoulderStrapSpec[] = [
  { key: "left", position: [-0.1, 0.19, 0], rotation: [0, 0, 0.15] },
  { key: "right", position: [0.1, 0.19, 0], rotation: [0, 0, -0.15] },
];

const POUCH_POSITIONS: V3[] = [
  [-0.09, -0.02, 0.145],
  [0, -0.02, 0.145],
  [0.09, -0.02, 0.145],
];

export function GunnerTorso({ palette, materials }: GunnerTorsoProps) {
  const crewMaterials = useCrewMaterials(palette, materials);

  const geometries = useMemo(
    () => ({
      chest: new CylinderGeometry(0.2, 0.16, 0.44, 14),
      collar: new CylinderGeometry(0.085, 0.095, 0.05, 12),
      vest: new CylinderGeometry(0.212, 0.178, 0.3, 14),
      strap: new BoxGeometry(0.07, 0.03, 0.2),
      pouch: new BoxGeometry(0.07, 0.1, 0.04),
      belt: new CylinderGeometry(0.172, 0.172, 0.05, 14),
      buckle: new BoxGeometry(0.05, 0.04, 0.015),
      radio: new BoxGeometry(0.2, 0.2, 0.07),
    }),
    [],
  );

  const localMaterials = useMemo(
    () => ({
      vest: new MeshStandardMaterial({
        color: palette.vest,
        roughness: 0.7,
        metalness: 0.2,
      }),
      buckle: new MeshStandardMaterial({
        color: "#6b6b66",
        roughness: 0.4,
        metalness: 0.8,
      }),
      radio: new MeshStandardMaterial({
        color: palette.vest,
        roughness: 0.6,
        metalness: 0.3,
      }),
    }),
    [palette.vest],
  );

  useEffect(() => {
    return () => {
      Object.values(geometries).forEach((geometry) => geometry.dispose());
    };
  }, [geometries]);

  useEffect(() => {
    return () => {
      Object.values(localMaterials).forEach((material) => material.dispose());
    };
  }, [localMaterials]);

  return (
    <group position={[0, 0.38, 0]}>
      <mesh
        scale={[1, 1, 0.66]}
        geometry={geometries.chest}
        material={crewMaterials.uniformBody}
        castShadow
      />
      <mesh
        position={[0, 0.225, -0.005]}
        geometry={geometries.collar}
        material={crewMaterials.uniformBody}
        castShadow
      />
      <mesh
        position={[0, 0.02, 0.005]}
        scale={[1, 1, 0.7]}
        geometry={geometries.vest}
        material={localMaterials.vest}
        castShadow
      />
      {SHOULDER_STRAPS.map((strap) => (
        <mesh
          key={strap.key}
          position={strap.position}
          rotation={strap.rotation}
          geometry={geometries.strap}
          material={crewMaterials.gearSoft}
          castShadow
        />
      ))}
      {POUCH_POSITIONS.map((position, index) => (
        <mesh
          key={index}
          position={position}
          geometry={geometries.pouch}
          material={crewMaterials.gearSoft}
          castShadow
        />
      ))}
      <mesh
        position={[0, -0.2, 0]}
        scale={[1, 1, 0.72]}
        geometry={geometries.belt}
        material={crewMaterials.gearBelt}
        castShadow
      />
      <mesh
        position={[0, -0.2, 0.13]}
        geometry={geometries.buckle}
        material={localMaterials.buckle}
        castShadow
      />
      <mesh
        position={[0, 0.04, -0.17]}
        geometry={geometries.radio}
        material={localMaterials.radio}
        castShadow
      />
    </group>
  );
}