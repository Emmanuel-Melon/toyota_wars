// packages/models/src/vehicle/components/gunner/gunner-arms.tsx
import type { ResolvedPalette } from "../../types";
import type { V3 } from "../../types";
import { Joint, Limb } from "./limb";

type Role = "gunner" | "loader";

type GunnerArmsProps = {
  palette: ResolvedPalette;
  role?: Role;
};

type ArmPose = { elbow: V3; hand: V3 };

// Gunner: both hands on the traverse/elevation controls.
// Loader: right hand cradling the round, left hand steadying it.
const ARM_POSES: Record<Role, Record<"-1" | "1", ArmPose>> = {
  gunner: {
    "-1": { elbow: [-0.28, 0.32, 0.08], hand: [-0.13, 0.3, 0.3] },
    "1": { elbow: [0.28, 0.32, 0.08], hand: [0.13, 0.3, 0.3] },
  },
  loader: {
    "-1": { elbow: [-0.28, 0.3, 0.1], hand: [-0.04, 0.26, 0.36] },
    "1": { elbow: [0.3, 0.34, 0.06], hand: [0.12, 0.3, 0.34] },
  },
};

type ArmProps = {
  palette: ResolvedPalette;
  side: -1 | 1;
  pose: ArmPose;
};

function Arm({ palette, side, pose }: ArmProps) {
  const shoulder: V3 = [side * 0.21, 0.5, -0.02];

  return (
    <group>
      <Joint position={shoulder} radius={0.07} color={palette.uniform} />
      <Limb
        from={shoulder}
        to={pose.elbow}
        radiusFrom={0.058}
        radiusTo={0.05}
        color={palette.uniform}
      />
      <Joint position={pose.elbow} radius={0.05} color={palette.uniform} />
      <Limb
        from={pose.elbow}
        to={pose.hand}
        radiusFrom={0.048}
        radiusTo={0.036}
        color={palette.uniform}
      />

      {/* Gloved hand */}
      <mesh position={pose.hand} scale={[1, 0.8, 1.15]} castShadow>
        <sphereGeometry args={[0.05, 10, 8]} />
        <meshStandardMaterial color={palette.glove} roughness={0.8} />
      </mesh>
    </group>
  );
}

export function GunnerArms({ palette, role = "gunner" }: GunnerArmsProps) {
  const poses = ARM_POSES[role];

  return (
    <>
      <Arm palette={palette} side={-1} pose={poses["-1"]} />
      <Arm palette={palette} side={1} pose={poses["1"]} />
    </>
  );
}