import type { AgentContext, AgentMovementOrder } from "../agent.types";
import type { AgentVec3 } from "./geometry";
import type { AgentObstacle } from "./domain";

export interface AgentRepositionRequest {
  origin: AgentVec3;
  target: AgentVec3;
  blockingObstacle: AgentObstacle | null;
  obstacles: readonly AgentObstacle[];
  optimalRange: number;
  bodyRadius: number;
  clearance: number;
  bound: number;
  sampleCount: number;
  heading: number;
}

export interface AgentPorts {
  resolveFormationMovement(
    context: AgentContext,
    arriveRadius?: number,
    slowRadius?: number,
  ): AgentMovementOrder;
  findFiringRepositionPoint(request: AgentRepositionRequest): AgentVec3 | null;
}
