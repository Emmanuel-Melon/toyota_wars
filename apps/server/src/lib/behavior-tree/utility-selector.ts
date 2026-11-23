import { BTNode } from "./behavior-tree.core";
import { NodeState } from "./behavior-tree.config";

// ---------------------------------------------------------------------------
// Response curves: map a normalized input (0..1) to a score (0..1)
// ---------------------------------------------------------------------------

export type Curve = (x: number) => number;

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** Normalize a raw value into 0..1 given its expected range. */
export const remap = (v: number, min: number, max: number) => {
  const span = max - min;
  if (span === 0) return v >= max ? 1 : 0;
  return clamp01((v - min) / span);
};

export const curves = {
  linear: (): Curve => (x) => clamp01(x),
  invert: (): Curve => (x) => 1 - clamp01(x),
  /** Slow start, steep finish: "only matters when the value is high". */
  power:
    (p = 2): Curve =>
    (x) =>
      Math.pow(clamp01(x), p),
  /** Steep start, flat finish: "matters a lot as soon as the value is non-zero". */
  invPower:
    (p = 2): Curve =>
    (x) =>
      1 - Math.pow(1 - clamp01(x), p),
  /** Smooth threshold. midpoint = where it flips, steepness = how sharply. */
  logistic:
    (midpoint = 0.5, steepness = 10): Curve =>
    (x) =>
      clamp01(1 / (1 + Math.exp(-steepness * (clamp01(x) - midpoint)))),
  step:
    (threshold: number): Curve =>
    (x) =>
      x >= threshold ? 1 : 0,
  constant:
    (v: number): Curve =>
    () =>
      clamp01(v),
} as const;

// ---------------------------------------------------------------------------
// Considerations and options
// ---------------------------------------------------------------------------

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

/**
 * Multiply considerations (any 0 vetoes the option), then apply the
 * "compensation factor" so options with many considerations aren't unfairly punished.
 */
export function scoreConsiderations<C>(
  considerations: Consideration<C>[],
  ctx: C,
): number {
  if (considerations.length === 0) return 0;
  let score = 1;
  for (const consideration of considerations) {
    score *= clamp01(consideration.curve(clamp01(consideration.input(ctx))));
    if (score === 0) return 0;
  }
  const modification = 1 - 1 / considerations.length;
  return score + (1 - score) * modification * score;
}

export interface UtilityScoreRow<Id extends string> {
  id: Id;
  raw: number;
}

/** Score every option without considering momentum or commitment. */
export function scoreOptions<C, Id extends string>(
  options: UtilityOption<C, Id>[],
  ctx: C,
): UtilityScoreRow<Id>[] {
  return options.map((option) => ({
    id: option.id,
    raw: clamp01(
      scoreConsiderations(option.considerations, ctx) *
        Math.max(0, option.weight?.(ctx) ?? 1),
    ),
  }));
}

// ---------------------------------------------------------------------------
// Choosing with commitment (prevents flip-flopping between options)
// ---------------------------------------------------------------------------

export interface UtilityMemory<Id extends string> {
  currentId?: Id;
  since: number;
}

export interface ScoredRow<Id extends string> extends UtilityScoreRow<Id> {
  score: number;
}

export interface ChooseConfig<Id extends string> {
  /** Added to the current option's score. */
  momentumBonus?: number;
  /** Don't switch before this unless the current option scores 0. */
  minCommitMs?: number;
  debug?: (rows: ScoredRow<Id>[], chosen: Id) => void;
}

export function chooseOption<C, Id extends string>(
  options: UtilityOption<C, Id>[],
  ctx: C,
  memory: UtilityMemory<Id>,
  now: number,
  { momentumBonus = 0.15, minCommitMs = 600, debug }: ChooseConfig<Id> = {},
): Id {
  if (options.length === 0) {
    throw new Error("chooseOption requires at least one option");
  }

  const rows = scoreOptions(options, ctx);
  const current =
    memory.currentId === undefined
      ? undefined
      : rows.find((row) => row.id === memory.currentId);

  // Stay committed for a short time as long as the current option is viable.
  if (current && current.raw > 0 && now - memory.since < minCommitMs) {
    debug?.(
      rows.map((row) => ({ ...row, score: row.raw })),
      current.id,
    );
    return current.id;
  }

  const scored: ScoredRow<Id>[] = rows.map((row) => ({
    id: row.id,
    raw: row.raw,
    score: row.raw + (row.id === memory.currentId ? momentumBonus : 0),
  }));

  let best = scored[0];
  for (const row of scored) {
    if (row.score > best.score) best = row;
  }

  if (best.id !== memory.currentId) {
    memory.currentId = best.id;
    memory.since = now;
  }
  debug?.(scored, best.id);
  return best.id;
}

// ---------------------------------------------------------------------------
// Utility selector as a behavior-tree node
// ---------------------------------------------------------------------------

export interface UtilitySelectorConfig<
  Id extends string,
> extends ChooseConfig<Id> {
  /** Monotonic clock used for commitment timing. */
  clock?: () => number;
  /** Try the next-ranked option if the chosen subtree returns FAILURE. */
  fallbackOnFailure?: boolean;
}

export class UtilitySelector<C, Id extends string> extends BTNode<C> {
  private readonly memory: UtilityMemory<Id> = { since: 0 };
  private readonly config: ChooseConfig<Id>;
  private readonly clock: () => number;
  private readonly fallbackOnFailure: boolean;

  constructor(
    private readonly options: UtilityOption<C, Id>[],
    private readonly children: Record<Id, BTNode<C>>,
    config: UtilitySelectorConfig<Id> = {},
  ) {
    super();
    const {
      clock = () => performance.now(),
      fallbackOnFailure = true,
      ...chooseConfig
    } = config;
    this.config = chooseConfig;
    this.clock = clock;
    this.fallbackOnFailure = fallbackOnFailure;
  }

  evaluate(ctx: C): NodeState {
    if (this.options.length === 0) return NodeState.FAILURE;

    const now = this.clock();
    const id = chooseOption(this.options, ctx, this.memory, now, this.config);
    const status = this.children[id]?.evaluate(ctx) ?? NodeState.FAILURE;

    if (status !== NodeState.FAILURE || !this.fallbackOnFailure) return status;

    // The chosen branch failed (e.g. a precondition changed): try alternatives
    // in descending score order instead of returning FAILURE immediately.
    const ranked = scoreOptions(this.options, ctx).sort(
      (a, b) => b.raw - a.raw,
    );
    for (const row of ranked) {
      if (row.id === id) continue;
      const child = this.children[row.id];
      if (!child) continue;
      const next = child.evaluate(ctx);
      if (next !== NodeState.FAILURE) {
        if (row.id !== this.memory.currentId) {
          this.memory.currentId = row.id;
          this.memory.since = now;
        }
        return next;
      }
    }

    return NodeState.FAILURE;
  }
}
