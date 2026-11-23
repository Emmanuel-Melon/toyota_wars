// lib/tanks/nodes/actions/follow-leader.ts
import type { TankContext } from "../../tanks.types";
import { MOVEMENT_CONFIG } from "../../../movement/movement.config";
import { BTNode } from "../../../behavior-tree/behavior-tree.core";
import { NodeState } from "../../../behavior-tree/behavior-tree.config";
import { resolveFormationMovement } from "../../tanks.formation";

/** Request movement toward the leader's formation slot. */
export class FollowLeader extends BTNode<TankContext> {
  constructor(
    private arriveRadius: number = MOVEMENT_CONFIG.follow.arriveRadius,
    private slowRadius: number = MOVEMENT_CONFIG.follow.slowRadius,
  ) {
    super();
  }

  evaluate(ctx: TankContext): NodeState {
    if (!ctx.leader) return NodeState.FAILURE;

    ctx.decision.movement = resolveFormationMovement(
      ctx,
      this.arriveRadius,
      this.slowRadius,
    );
    ctx.decision.weapon = { type: "hold" };
    return NodeState.RUNNING;
  }
}
