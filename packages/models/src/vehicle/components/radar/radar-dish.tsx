import { DoubleSide } from "three";
import type { VehiclePalette } from "../../types";

type RadarDishProps = {
  palette: VehiclePalette;
  wrecked?: boolean;
};

export function RadarDish({ palette, wrecked = false }: RadarDishProps) {
  const metal = wrecked ? "#3d3933" : palette.accent;
  const dish = wrecked ? "#5b5448" : palette.body;

  return (
    <group position={[0, 1.56, -0.35]}>
      <mesh position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.3, 0.16, 12]} />
        <meshStandardMaterial color={metal} roughness={0.75} metalness={0.2} />
      </mesh>

      <mesh position={[0, 0.46, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.07, 0.8, 10]} />
        <meshStandardMaterial color={metal} roughness={0.7} metalness={0.25} />
      </mesh>

      <group position={[0, 0.9, 0]} rotation={[-0.35, 0, 0]}>
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <sphereGeometry
            args={[0.58, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2.6]}
          />
          <meshStandardMaterial
            color={dish}
            side={DoubleSide}
            roughness={0.65}
            metalness={0.15}
          />
        </mesh>

        <mesh position={[0, 0, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.5, 8]} />
          <meshStandardMaterial color={metal} roughness={0.6} />
        </mesh>

        <mesh position={[0, 0, 0.6]}>
          <sphereGeometry args={[0.06, 10, 8]} />
          <meshStandardMaterial
            color={wrecked ? "#2a2723" : "#d8e6e2"}
            roughness={0.4}
          />
        </mesh>
      </group>
    </group>
  );
}
