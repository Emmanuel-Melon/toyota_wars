// lib/behavior-tree/behavior-tree.core.ts
import { NodeState } from "./behavior-tree.config";

export abstract class BTNode<C = unknown> {
  abstract evaluate(context: C): NodeState;
}

// Selector: Runs children in order until ONE succeeds (OR logic)
export class BTSelector<C = unknown> extends BTNode<C> {
  constructor(public children: BTNode<C>[]) {
    super();
  }
  evaluate(ctx: C): NodeState {
    for (const child of this.children) {
      const s = child.evaluate(ctx);
      if (s !== NodeState.FAILURE) return s;
    }
    return NodeState.FAILURE;
  }
}

// Sequence: Runs children in order until ONE fails (AND logic)
export class BTSequence<C = unknown> extends BTNode<C> {
  constructor(public children: BTNode<C>[]) {
    super();
  }
  evaluate(ctx: C): NodeState {
    for (const child of this.children) {
      const s = child.evaluate(ctx);
      if (s !== NodeState.SUCCESS) return s;
    }
    return NodeState.SUCCESS;
  }
}
