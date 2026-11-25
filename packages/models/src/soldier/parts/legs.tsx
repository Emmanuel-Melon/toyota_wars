// soldier/parts/legs.tsx
import type { SoldierAssets } from "../soldier.assets";
import type { LegPose, SoldierPose } from "../soldier.types";
import { Joint, Limb } from "./limb";

function Leg({ pose, assets }: { pose: LegPose; assets: SoldierAssets }) {
  const { geo, mat } = assets;

  return (
    <group>
      <Limb from={pose.hip} to={pose.knee} radiusFrom={0.075} radiusTo={0.06} material={mat.uniformLimb} />
      <Joint position={pose.knee} radius={0.062} material={mat.uniformLimb} />
      <Limb from={pose.knee} to={pose.ankle} radiusFrom={0.058} radiusTo={0.046} material={mat.uniformLimb} />
      <group position={pose.ankle}>
        <mesh position={[0, 0.02, 0]} geometry={geo.bootShaft} material={mat.boot} castShadow />
        <mesh position={[0, -0.04, 0.06]} geometry={geo.bootBody} material={mat.boot} castShadow />
        <mesh position={[0, -0.093, 0.065]} geometry={geo.bootSole} material={mat.sole} castShadow />
      </group>
    </group>
  );
}

export function SoldierLegs({ pose, assets }: { pose: SoldierPose; assets: SoldierAssets }) {
  const { geo, mat } = assets;
  return (
    <group>
      <mesh
        position={[0, 0.12, 0.03]}
        scale={[1, 1, 0.8]}
        geometry={geo.pelvis}
        material={mat.uniformBody}
        castShadow
      />
      <Leg pose={pose.legs[-1]} assets={assets} />
      <Leg pose={pose.legs[1]} assets={assets} />
    </group>
  );
}