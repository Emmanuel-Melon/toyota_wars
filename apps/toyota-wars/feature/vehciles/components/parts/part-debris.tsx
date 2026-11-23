import { WHEEL } from "@/feature/vehciles/vehicles.config";
import type { FallenPartProps, V3 } from "./types";

const GLASS_SHARDS: ReadonlyArray<readonly [number, number, number]> = [
  [-0.16, 0.04, 0.2],
  [0.1, -0.02, -0.35],
  [0.02, 0.06, 0.65],
  [-0.06, -0.05, -0.8],
];

type PartDebrisProps = {
  kind: FallenPartProps["debris"];
  position: V3;
  rotation: V3;
  color?: string;
};

/** Static visual left behind once a part lands. */
export function PartDebris({
  kind,
  position,
  rotation,
  color,
}: PartDebrisProps) {
  if (kind === "wheel") {
    return (
      <group position={position} rotation={rotation}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry
            args={[WHEEL.radius, WHEEL.radius, WHEEL.width, 16]}
          />
          <meshStandardMaterial color="#181818" roughness={0.95} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry
            args={[
              WHEEL.radius * 0.62,
              WHEEL.radius * 0.62,
              WHEEL.width * 0.9,
              12,
            ]}
          />
          <meshStandardMaterial
            color="#64748b"
            metalness={0.7}
            roughness={0.4}
          />
        </mesh>
      </group>
    );
  }

  if (kind === "door") {
    return (
      <mesh position={position} rotation={rotation} castShadow>
        <boxGeometry args={[0.045, 0.48, 0.86]} />
        <meshStandardMaterial color={color ?? "#4a4238"} roughness={0.7} />
      </mesh>
    );
  }

  if (kind === "hood") {
    return (
      <group position={position} rotation={rotation}>
        <mesh castShadow>
          <boxGeometry args={[1.6, 0.05, 1.15]} />
          <meshStandardMaterial
            color={color ?? "#4a4238"}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
        <mesh position={[0.24, 0.04, -0.18]} rotation={[0, 0.3, 0.12]}>
          <boxGeometry args={[0.8, 0.03, 0.5]} />
          <meshStandardMaterial
            color={color ?? "#4a4238"}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      </group>
    );
  }

  return (
    <group position={position} rotation={rotation}>
      {GLASS_SHARDS.map(([x, y, r], index) => (
        <mesh key={index} position={[x, y, 0]} rotation={[0, 0, r]}>
          <boxGeometry args={[0.12, 0.02, 0.02]} />
          <meshStandardMaterial
            color="#d7f6ff"
            emissive="#67d8ff"
            emissiveIntensity={0.2}
            transparent
            opacity={0.7}
            roughness={0.15}
          />
        </mesh>
      ))}
    </group>
  );
}
