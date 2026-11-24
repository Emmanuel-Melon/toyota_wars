import type { ResolvedPalette } from "../../types";

type GunnerHeadProps = {
  palette: ResolvedPalette;
};

export function GunnerHead({ palette }: GunnerHeadProps) {
  return (
    <group position={[0, 0.64, -0.02]}>
      <mesh position={[0, 0.04, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.07, 0.1, 8]} />
        <meshStandardMaterial color={palette.skin} roughness={0.8} />
      </mesh>

      <mesh position={[0, 0.18, 0.02]} castShadow>
        <boxGeometry args={[0.2, 0.22, 0.22]} />
        <meshStandardMaterial color={palette.skin} roughness={0.8} />
      </mesh>

      <mesh position={[0, 0.24, 0.02]} rotation={[-0.1, 0, 0]} castShadow>
        <boxGeometry args={[0.24, 0.14, 0.26]} />
        <meshStandardMaterial
          color={palette.helmet}
          roughness={0.6}
          metalness={0.3}
        />
      </mesh>

      <mesh position={[0, 0.22, 0.14]} castShadow>
        <boxGeometry args={[0.18, 0.06, 0.06]} />
        <meshStandardMaterial color="#111" roughness={0.2} metalness={0.8} />
      </mesh>
    </group>
  );
}
