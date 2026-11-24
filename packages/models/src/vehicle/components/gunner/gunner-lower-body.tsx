// packages/models/src/vehicle/components/gunner/gunner-lower-body.tsx
import { useEffect, useMemo } from "react";
import {
  BoxGeometry,
  CylinderGeometry,
  MeshStandardMaterial,
} from "three";
import type { ResolvedPalette, V3 } from "../../types";
import { SharedCrewMaterials, useCrewMaterials } from "../hooks/use-crew-materials";
import { Joint, Limb } from "./limb";

type Role = "gunner" | "loader";
type Side = -1 | 1;

type GunnerLowerBodyProps = {
  palette: ResolvedPalette;
  role?: Role;
  materials?: SharedCrewMaterials;
};

type ComputedLegPose = {
  hip: V3;
  knee: V3;
  ankle: V3;
};

const COMPUTED_POSES: Record<Role, Record<Side, ComputedLegPose>> = {
  gunner: {
    [-1]: {
      hip: [-0.09, 0.1, 0.02],
      knee: [-0.1, 0.14, 0.3],
      ankle: [-0.1, -0.28, 0.34],
    },
    [1]: {
      hip: [0.09, 0.1, 0.02],
      knee: [0.1, 0.14, 0.3],
      ankle: [0.1, -0.28, 0.34],
    },
  },
  loader: {
    [-1]: {
      hip: [-0.09, 0.1, 0.02],
      knee: [-0.15, 0.22, 0.26],
      ankle: [-0.17, -0.28, 0.3],
    },
    [1]: {
      hip: [0.09, 0.1, 0.02],
      knee: [0.15, 0.22, 0.26],
      ankle: [0.17, -0.28, 0.3],
    },
  },
};

function Leg({
  pose,
  uniformMaterial,
  bootMaterial,
  soleMaterial,
  shaftGeometry,
  bodyGeometry,
  soleGeometry,
}: {
  pose: ComputedLegPose;
  uniformMaterial: MeshStandardMaterial;
  bootMaterial: MeshStandardMaterial;
  soleMaterial: MeshStandardMaterial;
  shaftGeometry: CylinderGeometry;
  bodyGeometry: BoxGeometry;
  soleGeometry: BoxGeometry;
}) {
  return (
    <group>
      <Limb
        from={pose.hip}
        to={pose.knee}
        radiusFrom={0.075}
        radiusTo={0.06}
        material={uniformMaterial}
      />
      <Joint position={pose.knee} radius={0.062} material={uniformMaterial} />
      <Limb
        from={pose.knee}
        to={pose.ankle}
        radiusFrom={0.058}
        radiusTo={0.046}
        material={uniformMaterial}
      />
      <group position={pose.ankle}>
        <mesh
          position={[0, 0.02, 0]}
          geometry={shaftGeometry}
          material={bootMaterial}
          castShadow
        />
        <mesh
          position={[0, -0.04, 0.06]}
          geometry={bodyGeometry}
          material={bootMaterial}
          castShadow
        />
        <mesh
          position={[0, -0.093, 0.065]}
          geometry={soleGeometry}
          material={soleMaterial}
          castShadow
        />
      </group>
    </group>
  );
}

export function GunnerLowerBody({
  palette,
  role = "gunner",
  materials,
}: GunnerLowerBodyProps) {
  const crewMaterials = useCrewMaterials(palette, materials);
  const poses = COMPUTED_POSES[role];

  const bootMaterial = useMemo(
    () => new MeshStandardMaterial({ color: palette.boots, roughness: 0.7 }),
    [palette.boots],
  );
  const soleMaterial = useMemo(
    () => new MeshStandardMaterial({ color: "#0d0d0c", roughness: 0.95 }),
    [],
  );
  const pelvisGeometry = useMemo(
    () => new CylinderGeometry(0.17, 0.165, 0.16, 14),
    [],
  );
  const shaftGeometry = useMemo(
    () => new CylinderGeometry(0.05, 0.055, 0.1, 10),
    [],
  );
  const bodyGeometry = useMemo(() => new BoxGeometry(0.1, 0.09, 0.2), []);
  const soleGeometry = useMemo(
    () => new BoxGeometry(0.105, 0.03, 0.22),
    [],
  );

  useEffect(() => {
    return () => {
      bootMaterial.dispose();
      soleMaterial.dispose();
    };
  }, [bootMaterial, soleMaterial]);

  useEffect(() => {
    return () => {
      pelvisGeometry.dispose();
      shaftGeometry.dispose();
      bodyGeometry.dispose();
      soleGeometry.dispose();
    };
  }, [pelvisGeometry, shaftGeometry, bodyGeometry, soleGeometry]);

  return (
    <group>
      <mesh
        position={[0, 0.12, 0.03]}
        scale={[1, 1, 0.8]}
        geometry={pelvisGeometry}
        material={crewMaterials.uniformBody}
        castShadow
      />
      <Leg
        pose={poses[-1]}
        uniformMaterial={crewMaterials.uniformLimb}
        bootMaterial={bootMaterial}
        soleMaterial={soleMaterial}
        shaftGeometry={shaftGeometry}
        bodyGeometry={bodyGeometry}
        soleGeometry={soleGeometry}
      />
      <Leg
        pose={poses[1]}
        uniformMaterial={crewMaterials.uniformLimb}
        bootMaterial={bootMaterial}
        soleMaterial={soleMaterial}
        shaftGeometry={shaftGeometry}
        bodyGeometry={bodyGeometry}
        soleGeometry={soleGeometry}
      />
    </group>
  );
}