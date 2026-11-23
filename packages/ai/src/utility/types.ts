export type Curve = (x: number) => number;

export interface Consideration<C> {
  name: string;
  input: (ctx: C) => number;
  curve: Curve;
}

export interface UtilityOption<C, Id extends string> {
  id: Id;
  considerations: Consideration<C>[];
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

export interface ChooseConfig<Id extends string> {
  momentumBonus?: number;
  minCommitMs?: number;
  selectionNoise?: number;
  debug?: (rows: ScoredRow<Id>[], chosen: Id) => void;
}
