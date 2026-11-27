// packages/models/src/vehicle/components/wheels/suspension-arms.tsx
import { WHEEL_VISUAL } from "../../config/vehicle-visual.config";

type SuspensionArmsProps = {
  side: number;
  radius?: number;
};

export function SuspensionArms({
  side,
  radius = WHEEL_VISUAL.radius,
}: SuspensionArmsProps) {
  const armLength = 0.55;

  return (
    <group>
      <mesh
        position={[-side * (armLength * 0.5), -radius * 0.35, 0]}
        rotation={[0, 0, -side * (Math.PI / 2 - 0.1)]}
        castShadow
      >
        <cylinderGeometry args={[0.035, 0.04, armLength, 8]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.4} />
      </mesh>

      <mesh
        position={[-side * (armLength * 0.42), radius * 0.25, 0]}
        rotation={[0, 0, -side * (Math.PI / 2 + 0.12)]}
        castShadow
      >
        <cylinderGeometry args={[0.025, 0.03, armLength * 0.85, 8]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.4} />
      </mesh>

      <group
        position={[-side * 0.22, radius * 0.15, 0]}
        rotation={[0, 0, side * 0.28]}
      >
        <mesh>
          <cylinderGeometry args={[0.025, 0.025, radius * 0.95, 8]} />
          <meshStandardMaterial
            color="#94a3b8"
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.065, 0.065, radius * 0.65, 12]} />
          <meshStandardMaterial
            color="#cbd5e1"
            metalness={0.4}
            roughness={0.6}
          />
        </mesh>
      </group>
    </group>
  );
}
