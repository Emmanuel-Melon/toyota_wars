// packages/models/src/vehicle/components/gunner/gunner-arms.tsx
import { useEffect, useMemo } from "react";
import { MeshStandardMaterial, SphereGeometry } from "three";
import type { ResolvedPalette, V3 } from "../../types";
import { SharedCrewMaterials, useCrewMaterials } from "../hooks/use-crew-materials";
import { Joint, Limb } from "./limb";

type Role = "gunner" | "loader";
type Side = -1 | 1;

type GunnerArmsProps = {
  palette: ResolvedPalette;
  role?: Role;
  materials?: SharedCrewMaterials;
};

type ArmPose = { elbow: V3; hand: V3 };

const SHOULDERS: Record<Side, V3> = {
  [-1]: [-0.21, 0.5, -0.02],
  [1]: [0.21, 0.5, -0.02],
};

const ARM_POSES: Record<Role, Record<Side, ArmPose>> = {
  gunner: {
    [-1]: { elbow: [-0.28, 0.32, 0.08], hand: [-0.13, 0.3, 0.3] },
    [1]: { elbow: [0.28, 0.32, 0.08], hand: [0.13, 0.3, 0.3] },
  },
  loader: {
    [-1]: { elbow: [-0.28, 0.3, 0.1], hand: [-0.04, 0.26, 0.36] },
    [1]: { elbow: [0.3, 0.34, 0.06], hand: [0.12, 0.3, 0.34] },
  },
};

function Arm({
  side,
  pose,
  uniformMaterial,
  gloveMaterial,
  gloveGeometry,
}: {
  side: Side;
  pose: ArmPose;
  uniformMaterial: MeshStandardMaterial;
  gloveMaterial: MeshStandardMaterial;
  gloveGeometry: SphereGeometry;
}) {
  const shoulder = SHOULDERS[side];

  return (
    <group>
      <Joint position={shoulder} radius={0.07} material={uniformMaterial} />
      <Limb
        from={shoulder}
        to={pose.elbow}
        radiusFrom={0.058}
        radiusTo={0.05}
        material={uniformMaterial}
      />
      <Joint position={pose.elbow} radius={0.05} material={uniformMaterial} />
      <Limb
        from={pose.elbow}
        to={pose.hand}
        radiusFrom={0.048}
        radiusTo={0.036}
        material={uniformMaterial}
      />
      <mesh
        position={pose.hand}
        scale={[1, 0.8, 1.15]}
        geometry={gloveGeometry}
        material={gloveMaterial}
        castShadow
      />
    </group>
  );
}

export function GunnerArms({
  palette,
  role = "gunner",
  materials,
}: GunnerArmsProps) {
  const crewMaterials = useCrewMaterials(palette, materials);
  const poses = ARM_POSES[role];

  const gloveMaterial = useMemo(
    () => new MeshStandardMaterial({ color: palette.glove, roughness: 0.8 }),
    [palette.glove],
  );
  const gloveGeometry = useMemo(() => new SphereGeometry(0.05, 10, 8), []);

  useEffect(() => {
    return () => {
      gloveMaterial.dispose();
    };
  }, [gloveMaterial]);

  useEffect(() => {
    return () => {
      gloveGeometry.dispose();
    };
  }, [gloveGeometry]);

  return (
    <>
      <Arm
        side={-1}
        pose={poses[-1]}
        uniformMaterial={crewMaterials.uniformLimb}
        gloveMaterial={gloveMaterial}
        gloveGeometry={gloveGeometry}
      />
      <Arm
        side={1}
        pose={poses[1]}
        uniformMaterial={crewMaterials.uniformLimb}
        gloveMaterial={gloveMaterial}
        gloveGeometry={gloveGeometry}
      />
    </>
  );
}