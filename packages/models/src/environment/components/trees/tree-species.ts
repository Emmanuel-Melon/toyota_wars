// trees/tree-species.ts
import { createAcaciaGeometry, createShadeTreeGeometry } from "../../geometry/tree-geometry";
import type { TreeGeometry } from "../../geometry/tree-geometry";

type SpeciesDef = {
  weight: number;
  minScale: number;
  maxScale: number;
  trunkRadius: number;
  create: () => TreeGeometry;
};

const acacia = (seed: number): SpeciesDef => ({
  weight: 1.2, minScale: 0.9, maxScale: 1.6, trunkRadius: 0.3,
  create: () => createAcaciaGeometry(seed),
});
const shade = (seed: number): SpeciesDef => ({
  weight: 1, minScale: 0.8, maxScale: 1.3, trunkRadius: 0.38,
  create: () => createShadeTreeGeometry(seed),
});

/** Each entry is one shared geometry; more variants = less visible repetition. */
export const TREE_SPECIES = {
  acaciaA: acacia(11),
  acaciaB: acacia(23),
  acaciaC: acacia(37),
  shadeA: shade(5),
  shadeB: shade(19),
} as const satisfies Record<string, SpeciesDef>;

export type TreeSpeciesId = keyof typeof TREE_SPECIES;
export const TREE_SPECIES_IDS = Object.keys(TREE_SPECIES) as TreeSpeciesId[];