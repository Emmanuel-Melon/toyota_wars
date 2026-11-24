// packages/models/src/vehicle/components/gunner/gunner-lower-body.tsx
import type { ResolvedPalette } from "../../types";
import type { V3 } from "../../types";
import { Joint, Limb } from "./limb";

type Role = "gunner" | "loader";

type GunnerLowerBodyProps = {
  palette: ResolvedPalette;
  role?: Role;
};

// Right-leg poses; x is mirrored for the left leg.
const LEG_POSES: Record<Role, { knee: V3; ankle: V3 }> = {
  gunner: { knee: [0.1, 0.14, 0.3], ankle: [0.1, -0.28, 0.34] },
  loader: { knee: [0.15, 0.22, 0.26], ankle: [0.17, -0.28, 0.3] },
};

type LegProps = {
  palette: ResolvedPalette;
  side: -1 | 1;
  role: Role;
};

function Leg({ palette, side, role }: LegProps) {
  const pose = LEG_POSES[role];
  const hip: V3 = [side * 0.09, 0.1, 0.02];
  const knee: V3 = [side * pose.knee[0], pose.knee[1], pose.knee[2]];
  const ankle: V3 = [side * pose.ankle[0], pose.ankle[1], pose.ankle[2]];

  return (
    <group>
      <Limb
        from={hip}
        to={knee}
        radiusFrom={0.075}
        radiusTo={0.06}
        color={palette.uniform}
      />
      <Joint position={knee} radius={0.062} color={palette.uniform} />
      <Limb
        from={knee}
        to={ankle}
        radiusFrom={0.058}
        radiusTo={0.046}
        color={palette.uniform}
      />

      {/* Boot: shaft, body, sole */}
      <group position={ankle}>
        <mesh position={[0, 0.02, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.055, 0.1, 10]} />
          <meshStandardMaterial color={palette.boots} roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.04, 0.06]} castShadow>
          <boxGeometry args={[0.1, 0.09, 0.2]} />
          <meshStandardMaterial color={palette.boots} roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.093, 0.065]} castShadow>
          <boxGeometry args={[0.105, 0.03, 0.22]} />
          <meshStandardMaterial color="#0d0d0c" roughness={0.95} />
        </mesh>
      </group>
    </group>
  );
}

export function GunnerLowerBody({
  palette,
  role = "gunner",
}: GunnerLowerBodyProps) {
  return (
    <group>
      {/* Pelvis */}
      <mesh position={[0, 0.12, 0.03]} scale={[1, 1, 0.8]} castShadow>
        <cylinderGeometry args={[0.17, 0.165, 0.16, 14]} />
        <meshStandardMaterial color={palette.uniform} roughness={0.9} />
      </mesh>

      <Leg palette={palette} side={-1} role={role} />
      <Leg palette={palette} side={1} role={role} />
    </group>
  );
}