// apps/toyota-wars/feature/weapons/components/mounts/dshk-mount.tsx
import type { MountProps } from "./types";

export function DshkMount({ palette }: MountProps) {
  return (
    <>
      <mesh position={[0, -0.13, 0]} castShadow>
        <boxGeometry args={[0.34, 0.1, 0.46]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      <mesh position={[0.27, -0.03, -0.04]} castShadow>
        <boxGeometry args={[0.2, 0.2, 0.26]} />
        <meshStandardMaterial color={palette.accent} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.45]} castShadow>
        <boxGeometry args={[0.18, 0.2, 0.7]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0, 1.05]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 1.5, 10]} />
        <meshStandardMaterial
          color="#1b1b1b"
          roughness={0.45}
          metalness={0.65}
        />
      </mesh>
      <mesh position={[0, 0, 1.76]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.12, 10]} />
        <meshStandardMaterial color="#111" roughness={0.5} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.15, 0.18]} castShadow>
        <boxGeometry args={[0.05, 0.08, 0.2]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[0, 0.02, -0.42]} castShadow>
        <boxGeometry args={[0.24, 0.04, 0.04]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.12, 0.02, -0.46]} castShadow>
          <boxGeometry args={[0.04, 0.04, 0.14]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      ))}
    </>
  );
}
