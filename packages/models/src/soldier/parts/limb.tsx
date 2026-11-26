// packages/models/src/vehicle/components/gunner/limb.tsx
import { useEffect, useMemo } from "react";
import {
  CylinderGeometry,
  MeshStandardMaterial,
  Quaternion,
  SphereGeometry,
  Vector3,
} from "three";
import { V3 } from "../soldier.types";

const _a = new Vector3();
const _b = new Vector3();
const _dir = new Vector3();
const _up = new Vector3(0, 1, 0);

type LimbProps = {
  from: V3;
  to: V3;
  radiusFrom: number;
  radiusTo: number;
  color?: string;
  roughness?: number;
  material?: MeshStandardMaterial;
};

/** Tapered cylinder spanning two points, so poses are authored as joint positions. */
export function Limb({
  from,
  to,
  radiusFrom,
  radiusTo,
  color = "#888",
  roughness = 0.9,
  material,
}: LimbProps) {
  const { position, quaternion, length } = useMemo(() => {
    _a.set(from[0], from[1], from[2]);
    _b.set(to[0], to[1], to[2]);
    _dir.subVectors(_b, _a);

    const rawLength = _dir.length();
    const safeLength = rawLength > 1e-6 ? rawLength : 1e-6;
    if (rawLength > 1e-6) {
      _dir.divideScalar(rawLength);
    } else {
      _dir.copy(_up);
    }

    return {
      position: _a.clone().add(_b).multiplyScalar(0.5),
      quaternion: new Quaternion().setFromUnitVectors(_up, _dir),
      length: safeLength,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from[0], from[1], from[2], to[0], to[1], to[2]]);

  const geometry = useMemo(
    () => new CylinderGeometry(radiusTo, radiusFrom, 1, 10),
    [radiusTo, radiusFrom],
  );

  const fallbackMaterial = useMemo(
    () =>
      material
        ? null
        : new MeshStandardMaterial({ color, roughness }),
    [material, color, roughness],
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  useEffect(() => {
    return () => {
      fallbackMaterial?.dispose();
    };
  }, [fallbackMaterial]);

  return (
    <mesh
      position={position}
      quaternion={quaternion}
      scale={[1, length, 1]}
      geometry={geometry}
      material={material ?? fallbackMaterial!}
      castShadow
    />
  );
}

type JointProps = {
  position: V3;
  radius: number;
  color?: string;
  roughness?: number;
  material?: MeshStandardMaterial;
};

export function Joint({
  position,
  radius,
  color = "#888",
  roughness = 0.9,
  material,
}: JointProps) {
  const geometry = useMemo(
    () => new SphereGeometry(radius, 10, 8),
    [radius],
  );

  const fallbackMaterial = useMemo(
    () =>
      material
        ? null
        : new MeshStandardMaterial({ color, roughness }),
    [material, color, roughness],
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  useEffect(() => {
    return () => {
      fallbackMaterial?.dispose();
    };
  }, [fallbackMaterial]);

  return (
    <mesh
      position={position}
      geometry={geometry}
      material={material ?? fallbackMaterial!}
      castShadow
    />
  );
}