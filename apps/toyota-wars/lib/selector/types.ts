// toyota-wars/lib/tanks/selector/types.ts
export type Curve = (x: number) => number;

export interface Consideration<C> {
  name: string;
  /** Normalized to 0..1 (use remap for raw world values). */
  input: (ctx: C) => number;
  curve: Curve;
}

export interface UtilityOption<C, Id extends string> {
  id: Id;
  considerations: Consideration<C>[];
  /** Per-unit multiplier, e.g. personality. 1 = neutral. */
  weight?: (ctx: C) => number;
}

export interface UtilityScoreRow<Id extends string> {
  id: Id;
  raw: number;
}

export interface ScoredRow<Id extends string> extends UtilityScoreRow<Id> {
  score: number;
}

export interface UtilityMemory<Id extends string> {
  currentId?: Id;
  since: number;
}

// lib/selector/types.ts — add to ChooseConfig
export interface ChooseConfig<Id extends string> {
  momentumBonus?: number;
  minCommitMs?: number;
  /** Uniform noise half-width added to each option's final score. 0 = deterministic. */
  selectionNoise?: number;
  debug?: (rows: ScoredRow<Id>[], chosen: Id) => void;
}
