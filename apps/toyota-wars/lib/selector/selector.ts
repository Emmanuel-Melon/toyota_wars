// toyota-wars/lib/tanks/selector/selector.ts
import { scoreOptions } from "./scoring";
import type {
  ChooseConfig,
  ScoredRow,
  UtilityMemory,
  UtilityOption,
} from "./types";

export function chooseOption<C, Id extends string>(
  options: UtilityOption<C, Id>[],
  ctx: C,
  memory: UtilityMemory<Id>,
  now: number,
  {
    momentumBonus = 0.15,
    minCommitMs = 600,
    selectionNoise = 0,
    debug,
  }: ChooseConfig<Id> = {},
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

  const scored: ScoredRow<Id>[] = rows.map((row) => {
    const base =
      row.raw +
      (row.id === memory.currentId && row.raw > 0 ? momentumBonus : 0);
    // Vetoed options never receive noise: a 0-raw option must never win.
    // Noise is added to `score` and not clamped — clamping would compress
    // the top of the range where ties actually matter. Order is what wins.
    const noise =
      row.raw > 0 && selectionNoise > 0
        ? (Math.random() * 2 - 1) * selectionNoise
        : 0;
    return { id: row.id, raw: row.raw, score: base + noise };
  });

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
