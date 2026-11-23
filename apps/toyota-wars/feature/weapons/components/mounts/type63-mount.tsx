// apps/toyota-wars/feature/weapons/components/mounts/type63-mount.tsx
import type { MountProps } from "./types";

const TUBE_XS = [-0.27, -0.09, 0.09, 0.27];

export function Type63Mount({ palette }: MountProps) {
  return (
    <>
      <mesh position={[0, -0.13, 0]} castShadow>
        <boxGeometry args={[0.66, 0.1, 0.52]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.03, -0.12]} castShadow>
        <boxGeometry args={[0.58, 0.28, 0.5]} />
        <meshStandardMaterial color={palette.accent} roughness={0.7} />
      </mesh>
      <group rotation={[-0.18, 0, 0]}>
        <mesh position={[0, 0, 0.62]} castShadow>
          <boxGeometry args={[0.76, 0.38, 1.0]} />
          <meshStandardMaterial
            color="#2a2a2a"
            roughness={0.6}
            metalness={0.35}
          />
        </mesh>
        {TUBE_XS.map((x) => (
          <group key={x}>
            <mesh
              position={[x, 0, 1.0]}
              rotation={[Math.PI / 2, 0, 0]}
              castShadow
            >
              <cylinderGeometry args={[0.09, 0.09, 1.1, 10]} />
              <meshStandardMaterial
                color="#1b1b1b"
                roughness={0.5}
                metalness={0.6}
              />
            </mesh>
            <mesh
              position={[x, 0, 1.56]}
              rotation={[Math.PI / 2, 0, 0]}
              castShadow
            >
              <cylinderGeometry args={[0.1, 0.1, 0.08, 10]} />
              <meshStandardMaterial color="#111" roughness={0.5} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 0.28, 0.5]} castShadow>
          <boxGeometry args={[0.05, 0.16, 0.24]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[0, 0.38, 0.55]} castShadow>
          <boxGeometry args={[0.28, 0.04, 0.04]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      </group>
    </>
  );
}
