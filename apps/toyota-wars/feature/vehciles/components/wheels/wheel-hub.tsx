// apps/toyota-wars/feature/vehciles/components/wheels/wheel-hub.tsx
import { WHEEL } from "@/feature/vehciles/vehicles.config";

/**
 * Non-spinning hub + red steering marker. Purely visual — no refs,
 * no transforms of its own.
 */
export function WheelHub() {
  const r = WHEEL.radius;
  return (
    <>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[r * 0.55, r * 0.55, 0.04, 16]} />
        <meshStandardMaterial color="#2c2c2c" metalness={0.8} roughness={0.4} />
      </mesh>
      <mesh position={[0, r * 0.25, 0]}>
        <boxGeometry args={[0.08, 0.12, 0.16]} />
        <meshStandardMaterial color="#991b1b" roughness={0.5} />
      </mesh>
    </>
  );
}
