// vehicle/components/crew/crew-gunner.tsx
import { Soldier, poses, type SoldierPalette, type V3 } from "../../../soldier";

export type CrewGunnerProps = {
  palette?: SoldierPalette;
  role?: "gunner" | "loader";
};

const MOUNTS = {
  gunner: {
    pose: poses.seatedAiming,
    position: [0, -0.15, -0.45] as V3,
    rotation: [0.1, 0, 0] as V3,
  },
  loader: {
    pose: poses.seatedLoading,
    position: [0.35, -0.15, -0.65] as V3,
    rotation: [0.12, -0.15, 0] as V3,
  },
};

export function CrewGunner({ palette, role = "gunner" }: CrewGunnerProps) {
  const { pose, position, rotation } = MOUNTS[role];
  return <Soldier palette={palette} pose={pose} position={position} rotation={rotation} />;
}