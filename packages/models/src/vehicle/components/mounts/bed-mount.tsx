import type { BedMountProps } from "../../types";
import { MuzzleAnchor } from "./muzzle-anchor";
import { Pedestal } from "./pedestal";
import { TurretShield } from "./turret-shield";

export function BedMount({
  palette,
  mount,
  yawRef,
  pitchRef,
  slideRef,
  muzzleRef,
  muzzleZ,
  weapon,
  gunner,
  effects,
}: BedMountProps) {
  return (
    <>
      <Pedestal />

      <group ref={yawRef} position={[0, 0.78, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.07, 14]} />
          <meshStandardMaterial color={palette.accent} roughness={0.6} />
        </mesh>

        <TurretShield mount={mount} palette={palette} />

        <group ref={pitchRef} position={[0, 0.42, 0.15]}>
          <group ref={slideRef}>{weapon}</group>
          {gunner}
          <MuzzleAnchor
            muzzleRef={muzzleRef}
            muzzleZ={muzzleZ}
            rotation={mount === "rocketPod" ? [-0.18, 0, 0] : undefined}
          >
            {effects}
          </MuzzleAnchor>
        </group>
      </group>
    </>
  );
}
