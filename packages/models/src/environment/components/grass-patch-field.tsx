// packages/models/src/environment/components/grass-patch-field.tsx
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { ObstacleVisual, RoadClearance, TerrainSampler } from "../types";
import { getObstacleXZRadius } from "./obstacle-utils";

const ROAD_EDGE_MARGIN = 2;
const BOUND_MARGIN = 2;

export type GrassPatchFieldHandle = {
  scatter: (centerX: number, centerZ: number) => void;
};

type GrassPatchFieldProps = {
  initialCenterX: number;
  initialCenterZ: number;
  terrain: TerrainSampler;
  obstacles?: readonly ObstacleVisual[];
  roads?: Pick<RoadClearance, "distanceToRoad">;
  roadWidth?: number;
  bound?: number;
  areaSize?: number;
  count?: number;
  seed?: number;
};

function createCurvedBladeGeometry(
  baseWidth: number,
  height: number,
  archAmount: number,
  segments = 4,
): THREE.BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];

  for (let s = 0; s <= segments; s++) {
    const t = s / segments; // 0 at base, 1 at tip
    const taper = Math.max(0.08, 1 - Math.pow(t, 1.35) * 0.92);
    const halfW = (baseWidth * 0.5) * taper;
    const y = t * height - Math.pow(t, 2.2) * archAmount * 0.35;
    const z = Math.pow(t, 1.85) * archAmount;

    positions.push(-halfW, y, z);
    positions.push(halfW, y, z);

    if (s < segments) {
      const row = s * 2;
      const next = (s + 1) * 2;
      indices.push(row, row + 1, next);
      indices.push(row + 1, next + 1, next);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

function createDesertTuftGeometry(): THREE.BufferGeometry {
  const bladeConfigs: Array<{
    pos: [number, number, number];
    rot: [number, number, number];
    scale: [number, number, number];
    arch: number;
  }> = [
    // Inner upright shoots
    { pos: [0, 0, 0], rot: [0.06, 0.2, 0.04], scale: [1.0, 1.05, 1.0], arch: 0.14 },
    { pos: [0.03, 0, 0.02], rot: [-0.08, 1.4, 0.09], scale: [0.9, 0.95, 0.9], arch: 0.16 },
    { pos: [-0.03, 0, -0.02], rot: [0.09, 2.7, -0.08], scale: [0.85, 0.9, 0.85], arch: 0.15 },
    // Outer arching blades
    { pos: [0.07, 0, 0.04], rot: [0.22, 0.85, 0.18], scale: [1.05, 0.85, 1.05], arch: 0.28 },
    { pos: [-0.07, 0, 0.05], rot: [0.25, 2.15, -0.2], scale: [1.0, 0.8, 1.0], arch: 0.26 },
    { pos: [0.02, 0, -0.07], rot: [0.2, 3.6, -0.12], scale: [0.95, 0.76, 0.95], arch: 0.25 },
    { pos: [-0.05, 0, -0.05], rot: [0.18, 4.9, 0.16], scale: [0.9, 0.72, 0.9], arch: 0.24 },
    { pos: [0.08, 0, -0.03], rot: [0.24, 5.7, 0.14], scale: [0.85, 0.68, 0.85], arch: 0.22 },
  ];

  const parts = bladeConfigs.map(({ pos, rot, scale, arch }) => {
    const blade = createCurvedBladeGeometry(0.055, 0.48, arch, 4);
    const euler = new THREE.Euler(rot[0], rot[1], rot[2], "YXZ");
    const quat = new THREE.Quaternion().setFromEuler(euler);
    const vecPos = new THREE.Vector3(pos[0], pos[1], pos[2]);
    const vecScale = new THREE.Vector3(scale[0], scale[1], scale[2]);
    const mat = new THREE.Matrix4().compose(vecPos, quat, vecScale);

    blade.applyMatrix4(mat);
    const nonIndexed = blade.index ? blade.toNonIndexed() : blade;
    if (blade !== nonIndexed) {
      blade.dispose();
    }
    if (!nonIndexed.getAttribute("normal")) {
      nonIndexed.computeVertexNormals();
    }
    return nonIndexed;
  });

  const merged = mergeGeometries(parts, false);
  parts.forEach((part) => part.dispose());

  if (!merged) {
    throw new Error("Failed to merge desert tuft geometry");
  }
  return merged;
}

export const GrassPatchField = forwardRef<
  GrassPatchFieldHandle,
  GrassPatchFieldProps
>(function GrassPatchField(
  {
    initialCenterX,
    initialCenterZ,
    terrain,
    obstacles = [],
    roads,
    roadWidth = 0,
    bound,
    areaSize = 180,
    count = 900,
    seed = 17,
  },
  ref,
) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const centerRef = useRef({ x: initialCenterX, z: initialCenterZ });

  const geometry = useMemo(() => createDesertTuftGeometry(), []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        roughness: 0.9,
        metalness: 0.02,
        side: THREE.DoubleSide,
      }),
    [],
  );

  const instanceSeeds = useMemo(() => {
    let state = seed >>> 0 || 17;
    const rand = () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 0xffffffff;
    };

    const palette = [
      new THREE.Color("#8b8d52"), // dry olive
      new THREE.Color("#a89b68"), // pale straw
      new THREE.Color("#737c4d"), // dusty sage
      new THREE.Color("#968856"), // sun-cured grass
    ];

    return Array.from({ length: count }, () => {
      const baseColor = palette[Math.floor(rand() * palette.length)].clone();
      const shadeShift = (rand() - 0.5) * 0.12;
      baseColor.offsetHSL(0, (rand() - 0.5) * 0.05, shadeShift);

      return {
        nx: rand() - 0.5,
        nz: rand() - 0.5,
        yaw: rand() * Math.PI * 2,
        scaleXZ: 0.55 + rand() * 1.15,
        scaleY: 0.5 + rand() * 1.15,
        color: baseColor,
      };
    });
  }, [count, seed]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    instanceSeeds.forEach((item, index) => {
      mesh.setColorAt(index, item.color);
    });
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  }, [instanceSeeds]);

  const snapStep = Math.max(20, areaSize * 0.25);
  const roadClearance = roadWidth / 2 + ROAD_EDGE_MARGIN;

  const scatterAround = (originX: number, originZ: number) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    centerRef.current = { x: originX, z: originZ };

    const dummy = new THREE.Object3D();
    const zeroScale = new THREE.Vector3(0, 0, 0);
    const up = new THREE.Vector3(0, 1, 0);
    const groundNormal = new THREE.Vector3();
    const tiltQuat = new THREE.Quaternion();
    const yawQuat = new THREE.Quaternion();

    const parsedObstacles = obstacles
      .map(getObstacleXZRadius)
      .filter(
        (obstacle): obstacle is NonNullable<typeof obstacle> =>
          obstacle !== null,
      );

    const eps = 1.0;

    for (let i = 0; i < instanceSeeds.length; i++) {
      const item = instanceSeeds[i];
      const wx = originX + item.nx * areaSize;
      const wz = originZ + item.nz * areaSize;

      const insideObstacle = parsedObstacles.some((obstacle) => {
        const dx = wx - obstacle.x;
        const dz = wz - obstacle.z;
        const pad = obstacle.radius + 1.2;
        return dx * dx + dz * dz < pad * pad;
      });

      const outsideBound =
        bound !== undefined &&
        (Math.abs(wx) > bound - BOUND_MARGIN ||
          Math.abs(wz) > bound - BOUND_MARGIN);
      const nearRoad =
        roads !== undefined && roads.distanceToRoad(wx, wz) < roadClearance;

      if (insideObstacle || outsideBound || nearRoad) {
        dummy.position.set(wx, -999, wz);
        dummy.scale.copy(zeroScale);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        continue;
      }

      const wy = terrain.getHeight(wx, wz);

      const hL = terrain.getHeight(wx - eps, wz);
      const hR = terrain.getHeight(wx + eps, wz);
      const hD = terrain.getHeight(wx, wz - eps);
      const hU = terrain.getHeight(wx, wz + eps);
      groundNormal.set(hL - hR, 2 * eps, hD - hU).normalize();

      if (groundNormal.y < 0.72) {
        dummy.position.set(wx, -999, wz);
        dummy.scale.copy(zeroScale);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        continue;
      }

      dummy.position.set(wx, wy - 0.02, wz);

      tiltQuat.setFromUnitVectors(up, groundNormal);
      yawQuat.setFromAxisAngle(up, item.yaw);
      dummy.quaternion.copy(tiltQuat).multiply(yawQuat);

      dummy.scale.set(item.scaleXZ, item.scaleY, item.scaleXZ);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  };

  useImperativeHandle(ref, () => ({
    scatter: (nextCenterX, nextCenterZ) =>
      scatterAround(nextCenterX, nextCenterZ),
  }));

  useEffect(() => {
    scatterAround(centerRef.current.x, centerRef.current.z);
  }, [
    terrain,
    obstacles,
    roads,
    roadClearance,
    bound,
    areaSize,
    snapStep,
    instanceSeeds,
  ]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      frustumCulled={false}
      receiveShadow
    />
  );
});