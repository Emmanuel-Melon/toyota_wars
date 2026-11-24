// packages/models/src/weapons/components/dshk-mount.tsx
import type { MountProps } from "../types";
import {
  MountAccent,
  MountBasePlate,
  MountBody,
  MountDarkBox,
  MountRearGrips,
} from "./mount-shared";

export function DshkMount({ palette }: MountProps) {
  return (
    <>
      <MountBasePlate size={[0.34, 0.1, 0.46]} />
      <MountAccent
        palette={palette}
        position={[0.27, -0.03, -0.04]}
        size={[0.2, 0.2, 0.26]}
      />
      <MountBody
        position={[0, 0, 0.45]}
        size={[0.18, 0.2, 0.7]}
        color="#2c2c2c"
        metalness={0.4}
      />
      <mesh position={[0, 0, 1.05]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 1.5, 10]} />
        <meshStandardMaterial
          color="#1b1b1b"
          roughness={0.45}
          metalness={0.65}
        />
      </mesh>
      <mesh position={[0, 0, 1.76]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.12, 10]} />
        <meshStandardMaterial color="#111" roughness={0.5} metalness={0.6} />
      </mesh>
      <MountDarkBox position={[0, 0.15, 0.18]} size={[0.05, 0.08, 0.2]} />
      <MountRearGrips span={0.24} z={-0.42} armZ={-0.46} />
    </>
  );
}
