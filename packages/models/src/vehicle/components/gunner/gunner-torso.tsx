// packages/models/src/vehicle/components/gunner/gunner-torso.tsx
import type { ResolvedPalette } from "../../types";

type GunnerTorsoProps = {
  palette: ResolvedPalette;
};

export function GunnerTorso({ palette }: GunnerTorsoProps) {
  return (
    <group position={[0, 0.38, 0]}>
      {/* Elliptical chest tapering to the waist */}
      <mesh scale={[1, 1, 0.66]} castShadow>
        <cylinderGeometry args={[0.2, 0.16, 0.44, 14]} />
        <meshStandardMaterial color={palette.uniform} roughness={0.85} />
      </mesh>

      {/* Plate carrier / vest */}
      <mesh position={[0, 0.02, 0.005]} scale={[1, 1, 0.7]} castShadow>
        <cylinderGeometry args={[0.212, 0.178, 0.3, 14]} />
        <meshStandardMaterial
          color={palette.vest}
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>

      {/* Shoulder straps */}
      {[-1, 1].map((side) => (
        <mesh
          key={`strap-${side}`}
          position={[side * 0.1, 0.19, 0]}
          rotation={[0, 0, side * -0.15]}
          castShadow
        >
          <boxGeometry args={[0.07, 0.03, 0.2]} />
          <meshStandardMaterial color={palette.gear} roughness={0.9} />
        </mesh>
      ))}

      {/* Chest magazine pouches */}
      {[-0.09, 0, 0.09].map((x) => (
        <mesh key={`pouch-${x}`} position={[x, -0.02, 0.145]} castShadow>
          <boxGeometry args={[0.07, 0.1, 0.04]} />
          <meshStandardMaterial color={palette.gear} roughness={0.9} />
        </mesh>
      ))}

      {/* Belt + buckle */}
      <mesh position={[0, -0.2, 0]} scale={[1, 1, 0.72]} castShadow>
        <cylinderGeometry args={[0.172, 0.172, 0.05, 14]} />
        <meshStandardMaterial color={palette.gear} roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.2, 0.13]} castShadow>
        <boxGeometry args={[0.05, 0.04, 0.015]} />
        <meshStandardMaterial
          color="#6b6b66"
          roughness={0.4}
          metalness={0.8}
        />
      </mesh>

      {/* Collar */}
      <mesh position={[0, 0.225, -0.005]} castShadow>
        <cylinderGeometry args={[0.085, 0.095, 0.05, 12]} />
        <meshStandardMaterial color={palette.uniform} roughness={0.85} />
      </mesh>

      {/* Radio pack */}
      <mesh position={[0, 0.04, -0.17]} castShadow>
        <boxGeometry args={[0.2, 0.2, 0.07]} />
        <meshStandardMaterial
          color={palette.vest}
          roughness={0.6}
          metalness={0.3}
        />
      </mesh>
    </group>
  );
}