// packages/models/src/vehicle/components/wheels/wheel-tire.tsx
import { WHEEL_VISUAL } from "../../config/vehicle-visual.config";

type WheelTireProps = {
  radius?: number;
  width?: number;
};

const spokeAngles = [0, Math.PI / 3, (2 * Math.PI) / 3];

export function WheelTire({
  radius = WHEEL_VISUAL.radius,
  width = WHEEL_VISUAL.width,
}: WheelTireProps) {
  return (
    <>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[radius, radius, width, 24]} />
        <meshStandardMaterial color="#181818" roughness={0.95} />
      </mesh>

      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry
          args={[radius * 1.01, radius * 1.01, width * 0.7, 16]}
        />
        <meshStandardMaterial color="#111111" roughness={1} wireframe />
      </mesh>

      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry
          args={[radius * 0.65, radius * 0.65, width * 0.85, 16]}
        />
        <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
      </mesh>

      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry
          args={[radius * 0.45, radius * 0.45, width * 0.9, 16]}
        />
        <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.5} />
      </mesh>

      {spokeAngles.map((angle, index) => (
        <mesh key={index} rotation={[0, 0, angle]}>
          <boxGeometry args={[width * 0.9, radius * 0.9, 0.06]} />
          <meshStandardMaterial
            color="#64748b"
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>
      ))}

      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry
          args={[radius * 0.2, radius * 0.2, width * 0.95, 12]}
        />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
      </mesh>
    </>
  );
}
