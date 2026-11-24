// packages/models/src/environment/components/location-site.tsx
import { useEffect, useMemo } from "react";
import {
  BoxGeometry,
  CylinderGeometry,
  MeshStandardMaterial,
} from "three";
import type { LocationSiteVisual } from "../types";

const WOOD = "#5a4632";
const PLANK_COLOR = "#c9b58a";
const HARDWARE_COLOR = "#3d342a";

type SignBoardSpec = {
  key: string;
  y: number;
  yaw: number;
  length: number;
  height: number;
  thickness: number;
};

const SIGN_BOARDS: readonly SignBoardSpec[] = [
  {
    key: "north-route",
    y: 2.82,
    yaw: 0.4 * Math.PI,
    length: 1.45,
    height: 0.28,
    thickness: 0.05,
  },
  {
    key: "west-route",
    y: 2.38,
    yaw: -0.5 * Math.PI,
    length: 1.25,
    height: 0.26,
    thickness: 0.05,
  },
];

function Signpost() {
  const geometries = useMemo(
    () => ({
      post: new CylinderGeometry(0.068, 0.095, 3.2, 10),
      cap: new CylinderGeometry(0.082, 0.072, 0.08, 10),
      baseCollar: new CylinderGeometry(0.12, 0.16, 0.14, 10),
      plank: new BoxGeometry(1, 1, 1),
      bracket: new BoxGeometry(0.14, 0.18, 0.11),
    }),
    [],
  );

  const materials = useMemo(
    () => ({
      post: new MeshStandardMaterial({
        color: WOOD,
        roughness: 0.9,
        metalness: 0.02,
      }),
      cap: new MeshStandardMaterial({
        color: HARDWARE_COLOR,
        roughness: 0.72,
        metalness: 0.25,
      }),
      baseCollar: new MeshStandardMaterial({
        color: "#6b5d4b",
        roughness: 0.96,
        metalness: 0.0,
      }),
      plank: new MeshStandardMaterial({
        color: PLANK_COLOR,
        roughness: 0.82,
        metalness: 0.02,
      }),
      bracket: new MeshStandardMaterial({
        color: HARDWARE_COLOR,
        roughness: 0.65,
        metalness: 0.35,
      }),
    }),
    [],
  );

  useEffect(() => {
    return () => {
      Object.values(geometries).forEach((g) => g.dispose());
      Object.values(materials).forEach((m) => m.dispose());
    };
  }, [geometries, materials]);

  return (
    <group>
      {/* Grounded base collar */}
      <mesh
        position={[0, 0.07, 0]}
        geometry={geometries.baseCollar}
        material={materials.baseCollar}
        castShadow
        receiveShadow
      />

      {/* Main tapered timber post */}
      <mesh
        position={[0, 1.6, 0]}
        geometry={geometries.post}
        material={materials.post}
        castShadow
        receiveShadow
      />

      {/* Top cap */}
      <mesh
        position={[0, 3.23, 0]}
        geometry={geometries.cap}
        material={materials.cap}
        castShadow
      />

      {/* Directional signboards + mounting brackets */}
      {SIGN_BOARDS.map((board) => {
        const reachOffset = board.length * 0.42;
        return (
          <group key={board.key} position={[0, board.y, 0]} rotation={[0, board.yaw, 0]}>
            <mesh
              position={[0.03, 0, 0]}
              geometry={geometries.bracket}
              material={materials.bracket}
              castShadow
            />
            <mesh
              position={[reachOffset, 0, 0]}
              scale={[board.length, board.height, board.thickness]}
              geometry={geometries.plank}
              material={materials.plank}
              castShadow
              receiveShadow
            />
          </group>
        );
      })}
    </group>
  );
}

export function LocationSite({ location }: { location: LocationSiteVisual }) {
  const [offsetX, offsetZ] = location.siteOffset ?? [0, 0];
  return (
    <group position={[location.x + offsetX, location.y, location.z + offsetZ]}>
      {location.kind === "crossroads" && <Signpost />}
    </group>
  );
}