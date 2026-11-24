import type { ReactNode, RefObject } from "react";
import type * as THREE from "three";
import type { V3 } from "../../types";

type MuzzleAnchorProps = {
  muzzleRef?: RefObject<THREE.Object3D | null>;
  muzzleZ: number;
  rotation?: V3;
  children?: ReactNode;
};

export function MuzzleAnchor({
  muzzleRef,
  muzzleZ,
  rotation,
  children,
}: MuzzleAnchorProps) {
  return (
    <group rotation={rotation}>
      <group ref={muzzleRef} position={[0, 0, muzzleZ]} />
      {children}
    </group>
  );
}
