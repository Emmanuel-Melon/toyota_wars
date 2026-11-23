import { NodeState } from "./node-state";

export abstract class BTNode<C = unknown> {
  abstract evaluate(context: C): NodeState;
}

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
