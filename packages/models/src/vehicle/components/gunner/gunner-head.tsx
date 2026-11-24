// packages/models/src/vehicle/components/gunner/gunner-head.tsx
import { useEffect, useMemo } from "react";
import { DoubleSide, MeshStandardMaterial } from "three";
import type { ResolvedPalette } from "../../types";
import { Limb } from "./limb";
import { SharedCrewMaterials, useCrewMaterials } from "../hooks/use-crew-materials";

type GunnerHeadProps = {
  palette: ResolvedPalette;
  materials?: SharedCrewMaterials;
};

function Helmet({
  palette,
  gearMaterial,
}: {
  palette: ResolvedPalette;
  gearMaterial: MeshStandardMaterial;
}) {
  return (
    <>
      <mesh position={[0, 0.02, 0]} scale={[1, 1, 1.08]} castShadow>
        <sphereGeometry
          args={[0.125, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.58]}
        />
        <meshStandardMaterial
          color={palette.helmet}
          roughness={0.6}
          metalness={0.3}
          side={DoubleSide}
        />
      </mesh>
      <mesh
        position={[0, -0.011, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[1, 1.08, 1]}
        castShadow
      >
        <torusGeometry args={[0.121, 0.012, 8, 24]} />
        <meshStandardMaterial
          color={palette.helmet}
          roughness={0.6}
          metalness={0.3}
        />
      </mesh>

      {/* Chin strap */}
      {[-1, 1].map((side) => (
        <Limb
          key={`strap-${side}`}
          from={[side * 0.108, -0.01, 0.025]}
          to={[side * 0.05, -0.12, 0.07]}
          radiusFrom={0.005}
          radiusTo={0.005}
          material={gearMaterial}
        />
      ))}
    </>
  );
}

export function GunnerHead({ palette, materials }: GunnerHeadProps) {
  const crewMaterials = useCrewMaterials(palette, materials);
  const skinMaterial = useMemo(
    () => new MeshStandardMaterial({ color: palette.skin, roughness: 0.8 }),
    [palette.skin],
  );

  useEffect(() => {
    return () => {
      skinMaterial.dispose();
    };
  }, [skinMaterial]);

  return (
    <group position={[0, 0.6, -0.02]}>
      <mesh position={[0, 0.03, 0]} material={skinMaterial} castShadow>
        <cylinderGeometry args={[0.055, 0.065, 0.12, 10]} />
      </mesh>
      <group position={[0, 0.2, 0.02]}>
        <mesh scale={[0.95, 1.15, 1.05]} material={skinMaterial} castShadow>
          <sphereGeometry args={[0.1, 16, 12]} />
        </mesh>
        <mesh position={[0, -0.07, 0.03]} material={skinMaterial} castShadow>
          <boxGeometry args={[0.13, 0.07, 0.12]} />
        </mesh>
        <mesh position={[0, -0.02, 0.108]} material={skinMaterial} castShadow>
          <boxGeometry args={[0.025, 0.045, 0.04]} />
        </mesh>
        {[-1, 1].map((side) => (
          <group key={side}>
            <mesh
              position={[side * 0.098, -0.01, 0]}
              scale={[0.5, 1, 0.8]}
              material={skinMaterial}
              castShadow
            >
              <sphereGeometry args={[0.027, 8, 8]} />
            </mesh>
            <mesh position={[side * 0.04, 0.02, 0.095]}>
              <sphereGeometry args={[0.011, 8, 8]} />
              <meshStandardMaterial color="#0d0d0d" roughness={0.3} />
            </mesh>
          </group>
        ))}

        <Helmet palette={palette} gearMaterial={crewMaterials.gearSoft} />

        {/* Goggles */}
        <mesh
          position={[0, 0.06, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[1, 1.08, 1]}
        >
          <torusGeometry args={[0.121, 0.009, 6, 24]} />
          <meshStandardMaterial color="#111" roughness={0.9} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh
            key={`lens-${side}`}
            position={[side * 0.045, 0.06, 0.135]}
            rotation={[Math.PI / 2 - 0.35, 0, 0]}
          >
            <cylinderGeometry args={[0.032, 0.032, 0.025, 12]} />
            <meshStandardMaterial
              color={palette.lens}
              roughness={0.15}
              metalness={0.7}
            />
          </mesh>
        ))}

        {/* Comms headset */}
        {[-1, 1].map((side) => (
          <mesh
            key={`cup-${side}`}
            position={[side * 0.118, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[0.045, 0.045, 0.03, 12]} />
            <meshStandardMaterial color="#17191a" roughness={0.6} />
          </mesh>
        ))}
        <Limb
          from={[0.118, -0.02, 0.02]}
          to={[0.04, -0.075, 0.105]}
          radiusFrom={0.006}
          radiusTo={0.006}
          color="#111"
          roughness={0.6}
        />
        <mesh position={[0.04, -0.075, 0.105]}>
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshStandardMaterial color="#111" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}