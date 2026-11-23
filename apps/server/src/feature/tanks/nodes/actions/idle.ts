// lib/tanks/nodes/actions/idle.ts
import type { TankContext } from "../../tanks.types";
import { BTNode } from "../../../behavior-tree/behavior-tree.core";
import { NodeState } from "../../../behavior-tree/behavior-tree.config";

/** Standby: hold position, heading, and fire. */
export class IdleAction extends BTNode<TankContext> {
  evaluate(ctx: TankContext): NodeState {
    ctx.decision.movement = { type: "idle" };
    ctx.decision.weapon = { type: "hold" };
    return NodeState.RUNNING;
  }
}
