// apps/toyota-wars/feature/vehciles/gunner/gunner-lower-body.tsx
import type { ResolvedPalette } from "./crew-gunner.palette";

type Props = {
  palette: ResolvedPalette;
  role?: "gunner" | "loader";
};

/** Seated hips, thighs, and lower legs. */
export function GunnerLowerBody({ palette, role = "gunner" }: Props) {
  return (
    <group>
      {/* Hips / Pelvis */}
      <mesh position={[0, 0.12, 0.05]} castShadow>
        <boxGeometry args={[0.32, 0.18, 0.28]} />
        <meshStandardMaterial color={palette.uniform} roughness={0.9} />
      </mesh>

      {/* Legs (Thighs + Shins) */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.09, 0.05, 0.08]}>
          {/* Thigh (reaching forward to foot controls or dangling) */}
          <mesh
            rotation={role === "gunner" ? [0.8, 0, 0] : [1.2, 0, side * 0.2]}
            position={[0, -0.05, 0.12]}
            castShadow
          >
            <boxGeometry args={[0.11, 0.26, 0.12]} />
            <meshStandardMaterial color={palette.uniform} roughness={0.9} />
          </mesh>

          {/* Shin / Combat Boots (dropping down to pedals/floor) */}
          <mesh
            rotation={role === "gunner" ? [-0.2, 0, 0] : [0, 0, 0]}
            position={[0, -0.22, role === "gunner" ? 0.22 : 0.02]}
            castShadow
          >
            <boxGeometry args={[0.1, 0.28, 0.11]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
