// packages/models/src/vehicle/components/gunner/limb.tsx
import { useMemo } from "react";
import { Quaternion, Vector3 } from "three";
import type { V3 } from "../../types";

type LimbProps = {
  from: V3;
  to: V3;
  radiusFrom: number;
  radiusTo: number;
  color: string;
  roughness?: number;
};

/** Tapered cylinder spanning two points, so poses are authored as joint positions. */
export function Limb({
  from,
  to,
  radiusFrom,
  radiusTo,
  color,
  roughness = 0.9,
}: LimbProps) {
  const { position, quaternion, length } = useMemo(() => {
    const a = new Vector3(...from);
    const b = new Vector3(...to);
    const dir = b.clone().sub(a);
    const length = dir.length();
    const quaternion = new Quaternion().setFromUnitVectors(
      new Vector3(0, 1, 0),
      dir.normalize(),
    );
    return { position: a.add(b).multiplyScalar(0.5), quaternion, length };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from[0], from[1], from[2], to[0], to[1], to[2]]);

  return (
    <mesh position={position} quaternion={quaternion} castShadow>
      <cylinderGeometry args={[radiusTo, radiusFrom, length, 10]} />
      <meshStandardMaterial color={color} roughness={roughness} />
    </mesh>
  );
}

type JointProps = {
  position: V3;
  radius: number;
  color: string;
  roughness?: number;
};

export function Joint({ position, radius, color, roughness = 0.9 }: JointProps) {
  return (
    <mesh position={position} castShadow>
      <sphereGeometry args={[radius, 10, 8]} />
      <meshStandardMaterial color={color} roughness={roughness} />
    </mesh>
  );
}