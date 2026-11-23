"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { useGameFrame } from "@/render-loop";
import type { TerrainSampler } from "@/lib/map/map.terrain";
import type { RoadNetwork } from "@/lib/map/map.network";

type WorldPosition = { readonly x: number; readonly z: number };

const ROAD_EDGE_MARGIN = 2;
const BOUND_MARGIN = 2;

interface ObstacleLike {
  readonly position?: { readonly x: number; readonly z: number };
  readonly x?: number;
  readonly z?: number;
  readonly radius?: number;
}

interface GrassPatchesProps {
  playerBody: { readonly position: WorldPosition };
  terrain: TerrainSampler;
  obstacles?: readonly ObstacleLike[];
  roads?: Pick<RoadNetwork, "distanceToRoad">;
  roadWidth?: number;
  bound?: number;
  areaSize?: number;
  count?: number;
  seed?: number;
}

/**
 * Builds a multi-blade desert scrub tuft geometry so each instance
 * reads as a clump of dry grass/shrub rather than a single cone.
 */
function createDesertTuftGeometry(): THREE.BufferGeometry {
  const bladeConfigs: Array<{
    pos: [number, number, number];
    rot: [number, number, number];
    scale: [number, number, number];
  }> = [
    { pos: [0, 0.24, 0], rot: [0.18, 0.2, 0.12], scale: [1, 1, 1] },
    {
      pos: [0.09, 0.2, 0.05],
      rot: [-0.24, 1.1, 0.28],
      scale: [0.85, 0.82, 0.85],
    },
    {
      pos: [-0.08, 0.19, 0.06],
      rot: [0.26, 2.1, -0.25],
      scale: [0.8, 0.76, 0.8],
    },
    {
      pos: [0.02, 0.17, -0.09],
      rot: [-0.2, 3.8, -0.18],
      scale: [0.75, 0.7, 0.75],
    },
    {
      pos: [-0.06, 0.15, -0.05],
      rot: [0.15, 5.1, 0.22],
      scale: [0.7, 0.62, 0.7],
    },
  ];

  const parts = bladeConfigs.map(({ pos, rot, scale }) => {
    // 3-sided tapered grass blade
    const blade = new THREE.ConeGeometry(0.065, 0.52, 4, 1, false);
    blade.translate(0, 0.26, 0); // pivot at base

    const euler = new THREE.Euler(rot[0], rot[1], rot[2]);
    const quat = new THREE.Quaternion().setFromEuler(euler);
    const vecPos = new THREE.Vector3(pos[0], pos[1], pos[2]);
    const vecScale = new THREE.Vector3(scale[0], scale[1], scale[2]);
    const mat = new THREE.Matrix4().compose(vecPos, quat, vecScale);

    blade.applyMatrix4(mat);
    // Ensure non-indexed + consistent attributes for clean merging
    const nonIndexed = blade.index ? blade.toNonIndexed() : blade;
    blade.dispose();
    if (!nonIndexed.getAttribute("normal")) {
      nonIndexed.computeVertexNormals();
    }
    return nonIndexed;
  });

  const merged = mergeGeometries(parts, false);
  parts.forEach((p) => p.dispose());

  if (!merged) {
    throw new Error("Failed to merge desert tuft geometry");
  }
  return merged;
}

function getObstacleXZRadius(obs: ObstacleLike): {
  x: number;
  z: number;
  radius: number;
} | null {
  const x = obs.position?.x ?? obs.x;
  const z = obs.position?.z ?? obs.z;
  if (typeof x !== "number" || typeof z !== "number") return null;
  const radius = typeof obs.radius === "number" ? obs.radius : 3;
  return { x, z, radius };
}

export function GrassPatches({
  playerBody,
  terrain,
  obstacles = [],
  roads,
  roadWidth = 0,
  bound,
  areaSize = 180,
  count = 900,
  seed = 17,
}: GrassPatchesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const lastCellRef = useRef<{ cx: number; cz: number } | null>(null);

  const geometry = useMemo(() => createDesertTuftGeometry(), []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        roughness: 0.92,
        metalness: 0.02,
      }),
    [],
  );

  // Pre-generate normalized deterministic offsets in [-0.5, 0.5] and per-instance traits
  const instanceSeeds = useMemo(() => {
    let state = seed >>> 0 || 17;
    const rand = () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 0xffffffff;
    };

    const dryOlive = new THREE.Color("#8b8d52");
    const paleStraw = new THREE.Color("#a89b68");
    const dustySage = new THREE.Color("#737c4d");
    const palette = [dryOlive, paleStraw, dustySage];

    return Array.from({ length: count }, () => ({
      nx: rand() - 0.5,
      nz: rand() - 0.5,
      yaw: rand() * Math.PI * 2,
      scaleXZ: 0.55 + rand() * 1.15,
      scaleY: 0.5 + rand() * 1.1,
      color: palette[Math.floor(rand() * palette.length)].clone(),
    }));
  }, [count, seed]);

  // Apply instance colors once
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    instanceSeeds.forEach((item, i) => {
      mesh.setColorAt(i, item.color);
    });
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  }, [instanceSeeds]);

  // Re-anchor patches when the player crosses a grid cell so grass stays around the player
  const snapStep = Math.max(20, areaSize * 0.25);
  const roadClearance = roadWidth / 2 + ROAD_EDGE_MARGIN;

  const scatterAround = (centerX: number, centerZ: number) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const dummy = new THREE.Object3D();
    const zeroScale = new THREE.Vector3(0, 0, 0);
    const up = new THREE.Vector3(0, 1, 0);
    const groundNormal = new THREE.Vector3();
    const tiltQuat = new THREE.Quaternion();
    const yawQuat = new THREE.Quaternion();

    const parsedObstacles = obstacles
      .map(getObstacleXZRadius)
      .filter((o): o is NonNullable<typeof o> => o !== null);

    const eps = 1.0;

    for (let i = 0; i < instanceSeeds.length; i++) {
      const item = instanceSeeds[i];
      const wx = centerX + item.nx * areaSize;
      const wz = centerZ + item.nz * areaSize;

      const insideObstacle = parsedObstacles.some((obs) => {
        const dx = wx - obs.x;
        const dz = wz - obs.z;
        const pad = obs.radius + 1.2;
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

      // Estimate terrain slope so grass doesn't stick out awkwardly on steep cliffs
      const hL = terrain.getHeight(wx - eps, wz);
      const hR = terrain.getHeight(wx + eps, wz);
      const hD = terrain.getHeight(wx, wz - eps);
      const hU = terrain.getHeight(wx, wz + eps);
      groundNormal.set(hL - hR, 2 * eps, hD - hU).normalize();

      // Hide on very steep slopes (up.y < 0.72)
      if (groundNormal.y < 0.72) {
        dummy.position.set(wx, -999, wz);
        dummy.scale.copy(zeroScale);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        continue;
      }

      // Sink base slightly (-0.03m) so roots stay anchored on uneven quads
      dummy.position.set(wx, wy - 0.03, wz);

      // Blend ~50% of terrain tilt with vertical yaw
      tiltQuat.setFromUnitVectors(up, groundNormal);
      yawQuat.setFromAxisAngle(up, item.yaw);
      dummy.quaternion.copy(tiltQuat).slerp(yawQuat, 0.5);

      dummy.scale.set(item.scaleXZ, item.scaleY, item.scaleXZ);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  };

  useEffect(() => {
    const cx = Math.round(playerBody.position.x / snapStep);
    const cz = Math.round(playerBody.position.z / snapStep);
    lastCellRef.current = { cx, cz };
    scatterAround(cx * snapStep, cz * snapStep);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terrain, obstacles, roads, roadClearance, bound, areaSize, snapStep]);

  useGameFrame(() => {
    const cx = Math.round(playerBody.position.x / snapStep);
    const cz = Math.round(playerBody.position.z / snapStep);
    const prev = lastCellRef.current;
    if (prev && prev.cx === cx && prev.cz === cz) return;

    lastCellRef.current = { cx, cz };
    scatterAround(cx * snapStep, cz * snapStep);
  }, "presentation");

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
      castShadow
      receiveShadow
    />
  );
}
