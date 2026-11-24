// packages/models/src/weapons/components/zu23-mount.tsx
import type { MountProps } from "../types";
import {
  MountAccent,
  MountBasePlate,
  MountBody,
  MountDarkBox,
  MountRearGrips,
} from "./mount-shared";

export function Zu23Pedals() {
  return (
    <group position={[0, -0.25, -0.2]}>
      {/* Foot pedal bracket / base bar */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.35, 8]} />
        <meshStandardMaterial color="#111" metalness={0.8} roughness={0.4} />
      </mesh>

      {/* Left and Right Pedals */}
      {[-1, 1].map((side) => (
        <group
          key={side}
          position={[side * 0.12, -0.05, 0.05]}
          rotation={[0.3, 0, 0]}
        >
          {/* Pedal arm */}
          <mesh position={[0, 0.06, -0.05]}>
            <boxGeometry args={[0.03, 0.12, 0.03]} />
            <meshStandardMaterial color="#222" />
          </mesh>
          {/* Pedal pad */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.08, 0.03, 0.08]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Zu23Mount({ palette }: MountProps) {
  return (
    <>
      <MountBasePlate size={[0.38, 0.12, 0.45]} />
      <MountAccent
        palette={palette}
        position={[0.26, -0.04, 0]}
        size={[0.18, 0.22, 0.3]}
      />
      <MountBody
        position={[0, 0, 0.12]}
        size={[0.32, 0.3, 0.82]}
        color="#2a2a2a"
        metalness={0.4}
      />
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh
            position={[side * 0.11, 0, 0.95]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
          >
            <cylinderGeometry args={[0.055, 0.055, 1.4, 10]} />
            <meshStandardMaterial
              color="#1c1c1c"
              roughness={0.4}
              metalness={0.7}
            />
          </mesh>
          <mesh
            position={[side * 0.11, 0, 1.68]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
          >
            <cylinderGeometry args={[0.075, 0.075, 0.16, 10]} />
            <meshStandardMaterial
              color="#111"
              roughness={0.5}
              metalness={0.6}
            />
          </mesh>
        </group>
      ))}
      <MountDarkBox position={[0, 0.2, 0.08]} size={[0.05, 0.09, 0.18]} />
      <MountRearGrips span={0.32} z={-0.45} armZ={-0.5} />
      <Zu23Pedals />
    </>
  );
}
