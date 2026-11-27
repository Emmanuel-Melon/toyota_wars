// trees/tree-placement.ts
import { TREE_SPECIES, TREE_SPECIES_IDS } from "./tree-species";
import type { TreeSpeciesId } from "./tree-species";

export const TREE_DEFAULTS = {
  cellSize: 26,
  cellRadius: 10, // window is (2r+1)² cells around the snapped center
  density: 0.22,
  seed: 41,
} as const;

/** The window re-centers every 4 cells, so cell boundaries always line up. */
export const getTreeSnapStep = (cellSize: number) => cellSize * 4;

export type TreePlacement = {
  x: number;
  z: number;
  yaw: number;
  scale: number;
  species: TreeSpeciesId;
  tint: number; // 0..1, used to blend palette colors
  radius: number; // trunk radius in world units (for future colliders)
};

export type TreePlacementOptions = {
  centerX: number;
  centerZ: number;
  cellSize: number;
  cellRadius: number;
  density: number;
  seed: number;
  accept: (x: number, z: number, trunkRadius: number) => boolean;
};

/** Deterministic 0..1 hash of a grid cell. */
function hash(ix: number, iz: number, seed: number, salt: number): number {
  let h =
    (Math.imul(ix, 374761393) ^
      Math.imul(iz, 668265263) ^
      Math.imul(seed + salt, 2246822519)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const TOTAL_WEIGHT = TREE_SPECIES_IDS.reduce((sum, id) => sum + TREE_SPECIES[id].weight, 0);

function pickSpecies(roll: number): TreeSpeciesId {
  let remaining = roll * TOTAL_WEIGHT;
  for (const id of TREE_SPECIES_IDS) {
    remaining -= TREE_SPECIES[id].weight;
    if (remaining <= 0) return id;
  }
  return TREE_SPECIES_IDS[TREE_SPECIES_IDS.length - 1];
}

export function placeTrees(options: TreePlacementOptions): TreePlacement[] {
  const { centerX, centerZ, cellSize, cellRadius, density, seed, accept } = options;
  const baseX = Math.round(centerX / cellSize);
  const baseZ = Math.round(centerZ / cellSize);
  const placements: TreePlacement[] = [];

  for (let iz = baseZ - cellRadius; iz <= baseZ + cellRadius; iz += 1) {
    for (let ix = baseX - cellRadius; ix <= baseX + cellRadius; ix += 1) {
      // Coarse 4x4-cell factor clumps trees into groves with open plains between
      const grove = 0.25 + 1.5 * hash(ix >> 2, iz >> 2, seed, 1);
      if (hash(ix, iz, seed, 2) > density * grove) continue;

      const x = (ix + (hash(ix, iz, seed, 3) - 0.5) * 0.7) * cellSize;
      const z = (iz + (hash(ix, iz, seed, 4) - 0.5) * 0.7) * cellSize;
      const species = pickSpecies(hash(ix, iz, seed, 5));
      const def = TREE_SPECIES[species];
      const scale = def.minScale + hash(ix, iz, seed, 6) * (def.maxScale - def.minScale);
      const radius = def.trunkRadius * scale;

      if (!accept(x, z, radius)) continue;

      placements.push({
        x,
        z,
        yaw: hash(ix, iz, seed, 7) * Math.PI * 2,
        scale,
        species,
        tint: hash(ix, iz, seed, 8),
        radius,
      });
    }
  }
  return placements;
}