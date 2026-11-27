// packages/models/src/environment/components/trees/tree-field.tsx
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import * as THREE from "three";
import type { ObstacleVisual, RoadClearance, TerrainSampler } from "../../types";
import { getObstacleXZRadius } from "../obstacle-utils";
import type { CircleXZ } from "../obstacle-utils";
import type { TreeGeometry } from "./tree-geometry";
import { placeTrees, TREE_DEFAULTS } from "./tree-placement";
import { TREE_SPECIES, TREE_SPECIES_IDS } from "./tree-species";
import type { TreeSpeciesId } from "./tree-species";
import { createTreeTextures } from "./tree-textures";

const ROAD_EDGE_MARGIN = 2;
const ROAD_CANOPY_MARGIN = 3; // keeps canopies from hanging over the road
const BOUND_MARGIN = 4;
const BLOCKER_PAD = 2.5;
const MIN_GROUND_NORMAL_Y = 0.8;
const EMPTY: readonly never[] = [];

// Tints multiply the textures, so keep them light. Tune CANOPY_TINTS to your lighting/season.
const TRUNK_TINTS = [new THREE.Color("#cfc4b6"), new THREE.Color("#f2ece4")] as const;
const CANOPY_TINTS = [new THREE.Color("#7f8f48"), new THREE.Color("#b3aa66")] as const;

export type TreeFieldHandle = {
  scatter: (centerX: number, centerZ: number) => void;
};

type TreeFieldProps = {
  initialCenterX: number;
  initialCenterZ: number;
  terrain: TerrainSampler;
  obstacles?: readonly ObstacleVisual[];
  /** Extra no-tree zones: structure footprints, spawn areas, etc. */
  clearings?: readonly CircleXZ[];
  roads?: Pick<RoadClearance, "distanceToRoad">;
  roadWidth?: number;
  bound?: number;
  cellSize?: number;
  cellRadius?: number;
  density?: number;
  seed?: number;
};

type SpeciesMeshes = {
  trunk: THREE.InstancedMesh | null;
  canopy: THREE.InstancedMesh | null;
};

export const TreeField = forwardRef<TreeFieldHandle, TreeFieldProps>(
  function TreeField(
    {
      initialCenterX,
      initialCenterZ,
      terrain,
      obstacles = EMPTY,
      clearings = EMPTY,
      roads,
      roadWidth = 0,
      bound,
      cellSize = TREE_DEFAULTS.cellSize,
      cellRadius = TREE_DEFAULTS.cellRadius,
      density = TREE_DEFAULTS.density,
      seed = TREE_DEFAULTS.seed,
    },
    ref,
  ) {
    const centerRef = useRef({ x: initialCenterX, z: initialCenterZ });

    const meshes = useRef(
      Object.fromEntries(
        TREE_SPECIES_IDS.map((id) => [id, { trunk: null, canopy: null }]),
      ) as Record<TreeSpeciesId, SpeciesMeshes>,
    );

    const capacity = (2 * cellRadius + 1) ** 2; // at most one tree per cell

    const assets = useMemo(
      () =>
        Object.fromEntries(
          TREE_SPECIES_IDS.map((id) => [id, TREE_SPECIES[id].create()]),
        ) as Record<TreeSpeciesId, TreeGeometry>,
      [],
    );
    const textures = useMemo(() => createTreeTextures(), []);

    const trunkMaterial = useMemo(
      () =>
        new THREE.MeshStandardMaterial({
          map: textures.barkMap,
          bumpMap: textures.barkBump,
          bumpScale: 1.6,
          roughness: 1,
          metalness: 0,
        }),
      [textures],
    );
    const canopyMaterial = useMemo(
      () =>
        new THREE.MeshStandardMaterial({
          map: textures.leafMap,
          alphaMap: textures.leafAlpha,
          alphaTest: 0.45,
          vertexColors: true, // baked underside/interior darkening
          roughness: 0.85,
          metalness: 0,
        }),
      [textures],
    );

    const blockers = useMemo(() => {
      const fromObstacles = obstacles
        .map(getObstacleXZRadius)
        .filter((c): c is CircleXZ => c !== null);
      return [...fromObstacles, ...clearings];
    }, [obstacles, clearings]);

    const roadClearance = roadWidth / 2 + ROAD_EDGE_MARGIN + ROAD_CANOPY_MARGIN;

    const scatterAround = (centerX: number, centerZ: number) => {
      centerRef.current = { x: centerX, z: centerZ };

      const eps = 1.0;
      const normal = new THREE.Vector3();
      const dummy = new THREE.Object3D();
      const trunkColor = new THREE.Color();
      const canopyColor = new THREE.Color();

      const accept = (x: number, z: number, trunkRadius: number) => {
        if (bound !== undefined) {
          const limit = bound - BOUND_MARGIN - trunkRadius;
          if (Math.abs(x) > limit || Math.abs(z) > limit) return false;
        }
        if (roads && roads.distanceToRoad(x, z) < roadClearance) return false;
        for (const b of blockers) {
          const pad = b.radius + BLOCKER_PAD;
          const dx = x - b.x;
          const dz = z - b.z;
          if (dx * dx + dz * dz < pad * pad) return false;
        }
        normal
          .set(
            terrain.getHeight(x - eps, z) - terrain.getHeight(x + eps, z),
            2 * eps,
            terrain.getHeight(x, z - eps) - terrain.getHeight(x, z + eps),
          )
          .normalize();
        return normal.y >= MIN_GROUND_NORMAL_Y;
      };

      const placements = placeTrees({
        centerX,
        centerZ,
        cellSize,
        cellRadius,
        density,
        seed,
        accept,
      });

      const counts = Object.fromEntries(
        TREE_SPECIES_IDS.map((id) => [id, 0]),
      ) as Record<TreeSpeciesId, number>;

      for (const p of placements) {
        const slot = meshes.current[p.species];
        const index = counts[p.species];
        if (!slot.trunk || !slot.canopy || index >= capacity) continue;
        counts[p.species] += 1;

        dummy.position.set(p.x, terrain.getHeight(p.x, p.z) - 0.08, p.z);
        dummy.rotation.set(0, p.yaw, 0);
        dummy.scale.setScalar(p.scale);
        dummy.updateMatrix();

        slot.trunk.setMatrixAt(index, dummy.matrix);
        slot.canopy.setMatrixAt(index, dummy.matrix);
        slot.trunk.setColorAt(
          index,
          trunkColor.copy(TRUNK_TINTS[0]).lerp(TRUNK_TINTS[1], p.tint),
        );
        slot.canopy.setColorAt(
          index,
          canopyColor.copy(CANOPY_TINTS[0]).lerp(CANOPY_TINTS[1], p.tint),
        );
      }

      for (const id of TREE_SPECIES_IDS) {
        const { trunk, canopy } = meshes.current[id];
        for (const mesh of [trunk, canopy]) {
          if (!mesh) continue;
          mesh.count = counts[id];
          mesh.instanceMatrix.needsUpdate = true;
          if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
          mesh.computeBoundingSphere();
        }
      }
    };

    useImperativeHandle(ref, () => ({
      scatter: (x, z) => scatterAround(x, z),
    }));

    useEffect(() => {
      scatterAround(centerRef.current.x, centerRef.current.z);
    }, [terrain, blockers, roads, roadClearance, bound, cellSize, cellRadius, density, seed]);

    useEffect(() => {
      return () => {
        TREE_SPECIES_IDS.forEach((id) => {
          assets[id].trunk.dispose();
          assets[id].canopy.dispose();
        });
        trunkMaterial.dispose();
        canopyMaterial.dispose();
        Object.values(textures).forEach((t) => t.dispose());
      };
    }, [assets, trunkMaterial, canopyMaterial, textures]);

    const bind =
      (id: TreeSpeciesId, part: keyof SpeciesMeshes) =>
      (mesh: THREE.InstancedMesh | null) => {
        meshes.current[id][part] = mesh;
      };

    return (
      <group name="tree-field">
        {TREE_SPECIES_IDS.map((id) => (
          <group key={id}>
            <instancedMesh
              ref={bind(id, "trunk")}
              args={[assets[id].trunk, trunkMaterial, capacity]}
              frustumCulled={false}
              castShadow
              receiveShadow
            />
            <instancedMesh
              ref={bind(id, "canopy")}
              args={[assets[id].canopy, canopyMaterial, capacity]}
              frustumCulled={false}
              castShadow
              receiveShadow
            />
          </group>
        ))}
      </group>
    );
  },
);