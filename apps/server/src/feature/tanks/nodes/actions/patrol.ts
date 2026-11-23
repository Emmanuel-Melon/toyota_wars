import * as THREE from "three";
import type { TankContext } from "../../tanks.types";
import { MOVEMENT_CONFIG } from "../../../movement/movement.config";
import { distanceXZ } from "../../../movement/movement.math";
import { BTNode } from "../../../behavior-tree/behavior-tree.core";
import { NodeState } from "../../../behavior-tree/behavior-tree.config";

/** Wander between random points around home, pausing at each. Stateful: one instance per vehicle. */
export class PatrolAction extends BTNode<TankContext> {
  private goal = new THREE.Vector3();
  private hasGoal = false;
  private wait = 0;
  private elapsed = 0;

  constructor(private radius: number = MOVEMENT_CONFIG.patrol.radius) {
    super();
  }

  evaluate(ctx: TankContext): NodeState {
    const cfg = MOVEMENT_CONFIG.patrol;

    if (this.wait > 0) {
      this.wait -= ctx.delta;
      ctx.decision.movement = { type: "idle" };
      ctx.decision.weapon = { type: "hold" };
      return NodeState.RUNNING;
    }

    if (!this.hasGoal) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * this.radius;
      this.goal.set(
        THREE.MathUtils.clamp(ctx.home.x + Math.cos(a) * r, -ctx.bound, ctx.bound),
        0,
        THREE.MathUtils.clamp(ctx.home.z + Math.sin(a) * r, -ctx.bound, ctx.bound),
      );
      this.hasGoal = true;
      this.elapsed = 0;
    }

    this.elapsed += ctx.delta;
    const arrived = distanceXZ(ctx.position, this.goal) <= cfg.arriveRadius;

    // Arrived, or stuck behind something for too long: pause, then pick a new point
    if (arrived || this.elapsed > cfg.giveUpAfter) {
      this.hasGoal = false;
      this.wait = cfg.pause[0] + Math.random() * (cfg.pause[1] - cfg.pause[0]);
      ctx.decision.movement = { type: "idle" };
      ctx.decision.weapon = { type: "hold" };
      return NodeState.RUNNING;
    }

    ctx.decision.movement = {
      type: "moveTo",
      point: this.goal,
      speed: MOVEMENT_CONFIG.throttle.patrol,
      stopDistance: cfg.arriveRadius,
    };
    ctx.decision.weapon = { type: "hold" };
    return NodeState.RUNNING;
  }
}
