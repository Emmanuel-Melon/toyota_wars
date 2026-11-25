// soldier/parts/arms.tsx
import type { SoldierAssets } from "../soldier.assets";
import type { ArmPose, Side, SoldierPose, V3 } from "../soldier.types";
import { Joint, Limb } from "./limb";

const SHOULDERS: Record<Side, V3> = {
  [-1]: [-0.21, 0.5, -0.02],
  [1]: [0.21, 0.5, -0.02],
};

function Arm({ side, pose, assets }: { side: Side; pose: ArmPose; assets: SoldierAssets }) {
  const { geo, mat } = assets;
  const shoulder = SHOULDERS[side];

  return (
    <group>
      <Joint position={shoulder} radius={0.07} material={mat.uniformLimb} />
      <Limb from={shoulder} to={pose.elbow} radiusFrom={0.058} radiusTo={0.05} material={mat.uniformLimb} />
      <Joint position={pose.elbow} radius={0.05} material={mat.uniformLimb} />
      <Limb from={pose.elbow} to={pose.hand} radiusFrom={0.048} radiusTo={0.036} material={mat.uniformLimb} />
      <mesh
        position={pose.hand}
        scale={[1, 0.8, 1.15]}
        geometry={geo.glove}
        material={mat.glove}
        castShadow
      />
    </group>
  );
}

export function SoldierArms({ pose, assets }: { pose: SoldierPose; assets: SoldierAssets }) {
  return (
    <>
      <Arm side={-1} pose={pose.arms[-1]} assets={assets} />
      <Arm side={1} pose={pose.arms[1]} assets={assets} />
    </>
  );
}