// apps/toyota-wars/feature/vehciles/gunner/gunner-torso.tsx
import type { ResolvedPalette } from "./crew-gunner.palette";

type Props = { palette: ResolvedPalette };

/** Torso with tactical vest plate. */
export function GunnerTorso({ palette }: Props) {
  return (
    <group position={[0, 0.38, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.36, 0.42, 0.24]} />
        <meshStandardMaterial color={palette.uniform} roughness={0.85} />
      </mesh>

      {/* Vest plate */}
      <mesh position={[0, 0.02, 0.03]} castShadow>
        <boxGeometry args={[0.34, 0.32, 0.2]} />
        <meshStandardMaterial
          color={palette.vest}
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>
    </group>
  );
}
