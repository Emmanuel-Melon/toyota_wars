// packages/models/src/vehicle/components/wheels/wheel-hub.tsx
import { WHEEL_VISUAL } from "../../config/vehicle-visual.config";

type WheelHubProps = {
  radius?: number;
};

export function WheelHub({ radius = WHEEL_VISUAL.radius }: WheelHubProps) {
  return (
    <>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[radius * 0.55, radius * 0.55, 0.04, 16]} />
        <meshStandardMaterial color="#2c2c2c" metalness={0.8} roughness={0.4} />
      </mesh>
      <mesh position={[0, radius * 0.25, 0]}>
        <boxGeometry args={[0.08, 0.12, 0.16]} />
        <meshStandardMaterial color="#991b1b" roughness={0.5} />
      </mesh>
    </>
  );
}
