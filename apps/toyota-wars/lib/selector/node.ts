// toyota-wars/lib/tanks/selector/node.ts
import { BTNode } from "../behavior-tree/behavior-tree.core";
import { NodeState } from "@/lib/behavior-tree/behavior-tree.config";
import { chooseOption } from "./selector";
import { scoreOptions } from "./scoring";
import type { ChooseConfig, UtilityMemory, UtilityOption } from "./types";

export interface UtilitySelectorConfig<
  C,
  Id extends string,
> extends ChooseConfig<Id> {
  /** Monotonic clock used for commitment timing. */
  clock?: () => number;
  /** Try the next-ranked option if the chosen subtree returns FAILURE. */
  fallbackOnFailure?: boolean;
  /** Script-level override; evaluated directly, bypassing scoring. */
  forcedIntent?: (ctx: C) => Id | undefined;
}

export class UtilitySelector<C, Id extends string> extends BTNode<C> {
  private readonly memory: UtilityMemory<Id> = { since: 0 };
  private readonly config: ChooseConfig<Id>;
  private readonly clock: () => number;
  private readonly fallbackOnFailure: boolean;
  private readonly forcedIntent?: (ctx: C) => Id | undefined;

  constructor(
    private readonly options: UtilityOption<C, Id>[],
    private readonly children: Record<Id, BTNode<C>>,
    config: UtilitySelectorConfig<C, Id> = {},
  ) {
    super();
    const {
      clock = () => performance.now(),
      fallbackOnFailure = true,
      forcedIntent,
      ...chooseConfig
    } = config;
    this.forcedIntent = forcedIntent;
    this.config = chooseConfig;
    this.clock = clock;
    this.fallbackOnFailure = fallbackOnFailure;
  }

  evaluate(ctx: C): NodeState {
    if (this.options.length === 0) return NodeState.FAILURE;

    const forced = this.forcedIntent?.(ctx);
    if (forced !== undefined && this.children[forced]) {
      return this.children[forced].evaluate(ctx);
    }

    const now = this.clock();
    const id = chooseOption(this.options, ctx, this.memory, now, this.config);
    const status = this.children[id]?.evaluate(ctx) ?? NodeState.FAILURE;

    if (status !== NodeState.FAILURE || !this.fallbackOnFailure) return status;

    const ranked = scoreOptions(this.options, ctx).sort(
      (a, b) => b.raw - a.raw,
    );
    for (const row of ranked) {
      if (row.id === id) continue;
      // Vetoed options (raw === 0) are not valid fallbacks, and since ranked
      // is sorted descending, nothing after this point is viable either.
      if (row.raw <= 0) break;
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
