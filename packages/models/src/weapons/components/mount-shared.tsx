import type { V3, VehiclePalette } from "../../vehicle/types";

export const SIDES = [-1, 1] as const;

export function MountBasePlate({ size }: { size: V3 }) {
  return (
    <mesh position={[0, -0.13, 0]} castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
    </mesh>
  );
}

export function MountAccent({
  palette,
  position,
  size,
}: {
  palette: VehiclePalette;
  position: V3;
  size: V3;
}) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={palette.accent} roughness={0.7} />
    </mesh>
  );
}

export function MountBody({
  position,
  size,
  color,
  metalness = 0.4,
}: {
  position: V3;
  size: V3;
  color: string;
  metalness?: number;
}) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        roughness={0.6}
        metalness={metalness}
      />
    </mesh>
  );
}

export function MountDarkBox({ position, size }: { position: V3; size: V3 }) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#111" />
    </mesh>
  );
}

export function MountRearGrips({
  span,
  z,
  armZ,
}: {
  span: number;
  z: number;
  armZ: number;
}) {
  return (
    <>
      <mesh position={[0, 0.02, z]} castShadow>
        <boxGeometry args={[span + 0.04, 0.04, 0.04]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {SIDES.map((side) => (
        <mesh key={side} position={[side * (span / 2), 0.02, armZ]} castShadow>
          <boxGeometry args={[0.04, 0.04, 0.14]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      ))}
    </>
  );
}
