// packages/models/src/weapons/components/type63-mount.tsx
import type { MountProps } from "../types";
import {
  MountAccent,
  MountBasePlate,
  MountBody,
  MountDarkBox,
} from "./mount-shared";

const TUBE_XS = [-0.27, -0.09, 0.09, 0.27];

export function Type63Mount({ palette }: MountProps) {
  return (
    <>
      <MountBasePlate size={[0.66, 0.1, 0.52]} />
      <MountAccent
        palette={palette}
        position={[0, 0.03, -0.12]}
        size={[0.58, 0.28, 0.5]}
      />
      <group rotation={[-0.18, 0, 0]}>
        <MountBody
          position={[0, 0, 0.62]}
          size={[0.76, 0.38, 1.0]}
          color="#2a2a2a"
          metalness={0.35}
        />
        {TUBE_XS.map((x) => (
          <group key={x}>
            <mesh
              position={[x, 0, 1.0]}
              rotation={[Math.PI / 2, 0, 0]}
              castShadow
            >
              <cylinderGeometry args={[0.09, 0.09, 1.1, 10]} />
              <meshStandardMaterial
                color="#1b1b1b"
                roughness={0.5}
                metalness={0.6}
              />
            </mesh>
            <mesh
              position={[x, 0, 1.56]}
              rotation={[Math.PI / 2, 0, 0]}
              castShadow
            >
              <cylinderGeometry args={[0.1, 0.1, 0.08, 10]} />
              <meshStandardMaterial color="#111" roughness={0.5} />
            </mesh>
          </group>
        ))}
        <MountDarkBox position={[0, 0.28, 0.5]} size={[0.05, 0.16, 0.24]} />
        <MountDarkBox position={[0, 0.38, 0.55]} size={[0.28, 0.04, 0.04]} />
      </group>
    </>
  );
}
