// soldier/parts/torso.tsx
import type { SoldierAssets } from "../soldier.assets";
import type { SoldierLoadout, V3 } from "../soldier.types";

const SHOULDER_STRAPS = [
  { key: "left", position: [-0.1, 0.19, 0] as V3, rotation: [0, 0, 0.15] as V3 },
  { key: "right", position: [0.1, 0.19, 0] as V3, rotation: [0, 0, -0.15] as V3 },
];

const POUCH_POSITIONS: V3[] = [
  [-0.09, -0.02, 0.145],
  [0, -0.02, 0.145],
  [0.09, -0.02, 0.145],
];

type Props = { assets: SoldierAssets; loadout: SoldierLoadout };

export function SoldierTorso({ assets, loadout }: Props) {
  const { geo, mat } = assets;

  return (
    <group position={[0, 0.38, 0]}>
      <mesh scale={[1, 1, 0.66]} geometry={geo.chest} material={mat.uniformBody} castShadow />
      <mesh position={[0, 0.225, -0.005]} geometry={geo.collar} material={mat.uniformBody} castShadow />

      {loadout.vest && (
        <>
          <mesh
            position={[0, 0.02, 0.005]}
            scale={[1, 1, 0.7]}
            geometry={geo.vest}
            material={mat.vest}
            castShadow
          />
          {SHOULDER_STRAPS.map((s) => (
            <mesh
              key={s.key}
              position={s.position}
              rotation={s.rotation}
              geometry={geo.strap}
              material={mat.gearSoft}
              castShadow
            />
          ))}
          {POUCH_POSITIONS.map((position, i) => (
            <mesh key={i} position={position} geometry={geo.pouch} material={mat.gearSoft} castShadow />
          ))}
        </>
      )}

      <mesh position={[0, -0.2, 0]} scale={[1, 1, 0.72]} geometry={geo.belt} material={mat.gearBelt} castShadow />
      <mesh position={[0, -0.2, 0.13]} geometry={geo.buckle} material={mat.buckle} castShadow />

      {loadout.radio && (
        <mesh position={[0, 0.04, -0.17]} geometry={geo.radio} material={mat.radio} castShadow />
      )}
    </group>
  );
}