// apps/toyota-wars/feature/vehciles/components/wheels/suspension-arms.tsx
import { WHEEL } from "@/feature/vehciles/vehicles.config";

type SuspensionArmProps = {
  side: number; // 1 for Left (+X), -1 for Right (-X)
};

export function SuspensionArms({ side }: SuspensionArmProps) {
  const r = WHEEL.radius;
  const armLength = 0.55;

  return (
    <group>
      {/* Lower Control Arm (extends INWARD via -side) */}
      <mesh
        position={[-side * (armLength * 0.5), -r * 0.35, 0]}
        rotation={[0, 0, -side * (Math.PI / 2 - 0.1)]}
        castShadow
      >
        <cylinderGeometry args={[0.035, 0.04, armLength, 8]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.4} />
      </mesh>

      {/* Upper Control Arm */}
      <mesh
        position={[-side * (armLength * 0.42), r * 0.25, 0]}
        rotation={[0, 0, -side * (Math.PI / 2 + 0.12)]}
        castShadow
      >
        <cylinderGeometry args={[0.025, 0.03, armLength * 0.85, 8]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.4} />
      </mesh>

      {/* Angled Coilover Strut / Spring (connects lower arm up to chassis) */}
      <group
        position={[-side * 0.22, r * 0.15, 0]}
        rotation={[0, 0, side * 0.28]}
      >
        {/* Inner damper rod */}
        <mesh>
          <cylinderGeometry args={[0.025, 0.025, r * 0.95, 8]} />
          <meshStandardMaterial
            color="#94a3b8"
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
        {/* Outer coil spring sleeve */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.065, 0.065, r * 0.65, 12]} />
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
