// toyota-wars/lib/selector/scoring.ts
import { clamp01 } from "./math";
import type { Consideration, UtilityOption, UtilityScoreRow } from "./types";

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

/**
 * Score every option without considering momentum or commitment.
 *
 * Options may share an id (e.g. followLeader / followSquad both drive the same
 * intent). They are OR-composed: the highest raw score represents the id, so
 * each id appears exactly once in the result. First-seen order is preserved,
 * which keeps tie-breaking by array position unchanged.
 */
export function scoreOptions<C, Id extends string>(
  options: UtilityOption<C, Id>[],
  ctx: C,
): UtilityScoreRow<Id>[] {
  const best = new Map<Id, number>();
  for (const option of options) {
    const raw = clamp01(
      scoreConsiderations(option.considerations, ctx) *
        Math.max(0, option.weight?.(ctx) ?? 1),
    );
    best.set(option.id, Math.max(best.get(option.id) ?? 0, raw));
  }
  return Array.from(best, ([id, raw]) => ({ id, raw }));
}
