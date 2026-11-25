// soldier/parts/head.tsx
import type { SoldierAssets } from "../soldier.assets";
import type { SoldierLoadout } from "../soldier.types";
import { Limb } from "./limb";

const SIDES = [-1, 1] as const;

type Props = { assets: SoldierAssets; loadout: SoldierLoadout };

export function SoldierHead({ assets, loadout }: Props) {
  const { geo, mat } = assets;

  return (
    <group position={[0, 0.6, -0.02]}>
      <mesh position={[0, 0.03, 0]} geometry={geo.neck} material={mat.skin} castShadow />

      <group position={[0, 0.2, 0.02]}>
        <mesh scale={[0.95, 1.15, 1.05]} geometry={geo.skull} material={mat.skin} castShadow />
        <mesh position={[0, -0.07, 0.03]} geometry={geo.jaw} material={mat.skin} castShadow />
        <mesh position={[0, -0.02, 0.108]} geometry={geo.nose} material={mat.skin} castShadow />
        {SIDES.map((side) => (
          <group key={side}>
            <mesh
              position={[side * 0.098, -0.01, 0]}
              scale={[0.5, 1, 0.8]}
              geometry={geo.ear}
              material={mat.skin}
              castShadow
            />
            <mesh position={[side * 0.04, 0.02, 0.095]} geometry={geo.eye} material={mat.eye} />
          </group>
        ))}

        {loadout.helmet && (
          <>
            <mesh
              position={[0, 0.02, 0]}
              scale={[1, 1, 1.08]}
              geometry={geo.helmetDome}
              material={mat.helmetDome}
              castShadow
            />
            <mesh
              position={[0, -0.011, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={[1, 1.08, 1]}
              geometry={geo.helmetRim}
              material={mat.helmet}
              castShadow
            />
            {SIDES.map((side) => (
              <Limb
                key={`strap-${side}`}
                from={[side * 0.108, -0.01, 0.025]}
                to={[side * 0.05, -0.12, 0.07]}
                radiusFrom={0.005}
                radiusTo={0.005}
                material={mat.gearSoft}
              />
            ))}
          </>
        )}

        {loadout.goggles && (
          <>
            <mesh
              position={[0, 0.06, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={[1, 1.08, 1]}
              geometry={geo.goggleStrap}
              material={mat.goggleStrap}
            />
            {SIDES.map((side) => (
              <mesh
                key={`lens-${side}`}
                position={[side * 0.045, 0.06, 0.135]}
                rotation={[Math.PI / 2 - 0.35, 0, 0]}
                geometry={geo.lens}
                material={mat.lens}
              />
            ))}
          </>
        )}

        {loadout.headset && (
          <>
            {SIDES.map((side) => (
              <mesh
                key={`cup-${side}`}
                position={[side * 0.118, 0, 0]}
                rotation={[0, 0, Math.PI / 2]}
                geometry={geo.headsetCup}
                material={mat.headset}
                castShadow
              />
            ))}
            <Limb
              from={[0.118, -0.02, 0.02]}
              to={[0.04, -0.075, 0.105]}
              radiusFrom={0.006}
              radiusTo={0.006}
              material={mat.blackGear}
            />
            <mesh position={[0.04, -0.075, 0.105]} geometry={geo.mic} material={mat.blackGear} />
          </>
        )}
      </group>
    </group>
  );
}