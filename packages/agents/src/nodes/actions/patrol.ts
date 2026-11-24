import { BTNode, NodeState } from "@toyota/ai";
import type { AgentContext } from "../../agent.types";
import { AgentMovementOrders, AgentWeaponOrders } from "../../agents.config";
import { clamp, distanceXZ, type Vec3 } from "../../contracts/geometry";

export class PatrolAction extends BTNode<AgentContext> {
  private goal: Vec3 = { x: 0, y: 0, z: 0 };
  private hasGoal = false;
  private wait = 0;
  private elapsed = 0;

  constructor(private radius?: number) {
    super();
  }

  evaluate(ctx: AgentContext): NodeState {
    const config = ctx.config;
    const radius = this.radius ?? config.patrolRadius;

    if (this.wait > 0) {
      this.wait -= ctx.delta;
      ctx.decision.movement = { type: AgentMovementOrders.Idle };
      ctx.decision.weapon = { type: AgentWeaponOrders.Hold };
      return NodeState.RUNNING;
    }

    if (!this.hasGoal) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.sqrt(Math.random()) * radius;
      this.goal.x = clamp(
        ctx.home.x + Math.cos(angle) * distance,
        -ctx.bound,
        ctx.bound,
      );
      this.goal.y = 0;
      this.goal.z = clamp(
        ctx.home.z + Math.sin(angle) * distance,
        -ctx.bound,
        ctx.bound,
      );
      this.hasGoal = true;
      this.elapsed = 0;
    }

    this.elapsed += ctx.delta;
    const arrived =
      distanceXZ(ctx.position, this.goal) <= config.patrolArriveRadius;

    if (arrived || this.elapsed > config.patrolGiveUpAfter) {
      this.hasGoal = false;
      this.wait =
        config.patrolPause[0] +
        Math.random() * (config.patrolPause[1] - config.patrolPause[0]);
      ctx.decision.movement = { type: AgentMovementOrders.Idle };
      ctx.decision.weapon = { type: AgentWeaponOrders.Hold };
      return NodeState.RUNNING;
    }

    ctx.decision.movement = {
      type: AgentMovementOrders.MoveTo,
      point: this.goal,
      speed: config.patrolSpeed,
      stopDistance: config.patrolArriveRadius,
    };
    ctx.decision.weapon = { type: AgentWeaponOrders.Hold };
    return NodeState.RUNNING;
  }
}
