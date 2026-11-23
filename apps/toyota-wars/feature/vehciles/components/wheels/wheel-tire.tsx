// apps/toyota-wars/feature/vehciles/components/wheels/wheel-tire.tsx
import { WHEEL } from "@/feature/vehciles/vehicles.config";

const SPOKE_ANGLES = [0, Math.PI / 3, (2 * Math.PI) / 3];

/**
 * Everything that rotates with the wheel — tire, wireframe tread, rims,
 * spokes, and hub bolt. Purely visual; spinning is applied by the parent.
 */
export function WheelTire() {
  const r = WHEEL.radius;
  const w = WHEEL.width;

  return (
    <>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[r, r, w, 24]} />
        <meshStandardMaterial color="#181818" roughness={0.95} />
      </mesh>

      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[r * 1.01, r * 1.01, w * 0.7, 16]} />
        <meshStandardMaterial color="#111111" roughness={1.0} wireframe />
      </mesh>

      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[r * 0.65, r * 0.65, w * 0.85, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
      </mesh>

      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[r * 0.45, r * 0.45, w * 0.9, 16]} />
        <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.5} />
      </mesh>

      {SPOKE_ANGLES.map((angle, i) => (
        <mesh key={i} rotation={[0, 0, angle]}>
          <boxGeometry args={[w * 0.9, r * 0.9, 0.06]} />
          <meshStandardMaterial
            color="#64748b"
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>
      ))}

      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[r * 0.2, r * 0.2, w * 0.95, 12]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
      </mesh>
    </>
  );
}
