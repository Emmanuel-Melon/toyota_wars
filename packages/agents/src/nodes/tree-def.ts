import type { BTNode } from "@toyota/ai";
import type { AgentContext } from "../agent.types";
import { AgentNodes, type AgentNodeId } from "./node-ids";

export type CheckTargetAssignedParams = Record<string, never>;
export type CheckHasLeaderParams = Record<string, never>;

export interface CheckTargetInRangeParams {
  range?: number;
}

export interface CheckAlignedParams {
  maxOffsetRad?: number;
}

export interface ChaseParams {
  standoff?: number;
}

export interface StandoffCombatParams {
  fightingDistance?: number;
  retreatDistance?: number;
  approachSpeed?: number;
}

export type FormationFireParams = Record<string, never>;

export interface FlankParams {
  orbitRadius?: number;
  orbitSpeed?: number;
  fireRange?: number;
}

export interface LoSRepositionParams {
  clearance?: number;
  sampleCount?: number;
}

export type PinCoverParams = Record<string, never>;
export type ShootParams = Record<string, never>;
export type PatrolParams = Record<string, never>;
export type FleeParams = Record<string, never>;

export interface CheckLeaderBeyondParams {
  distance: number;
}

export type CheckRetreatingParams = Record<string, never>;
export type CheckRoutedParams = Record<string, never>;
export type AimAtTargetParams = Record<string, never>;

export interface FollowLeaderParams {
  arriveRadius?: number;
  slowRadius?: number;
}

export interface AgentNodeParamsMap {
  [AgentNodes.CheckTargetAssigned]: CheckTargetAssignedParams;
  [AgentNodes.CheckHasLeader]: CheckHasLeaderParams;
  [AgentNodes.CheckTargetInRange]: CheckTargetInRangeParams;
  [AgentNodes.CheckAligned]: CheckAlignedParams;
  [AgentNodes.Chase]: ChaseParams;
  [AgentNodes.StandoffCombat]: StandoffCombatParams;
  [AgentNodes.FormationFire]: FormationFireParams;
  [AgentNodes.Flank]: FlankParams;
  [AgentNodes.LoSReposition]: LoSRepositionParams;
  [AgentNodes.PinCover]: PinCoverParams;
  [AgentNodes.Shoot]: ShootParams;
  [AgentNodes.Patrol]: PatrolParams;
  [AgentNodes.Flee]: FleeParams;
  [AgentNodes.CheckLeaderBeyond]: CheckLeaderBeyondParams;
  [AgentNodes.CheckRetreating]: CheckRetreatingParams;
  [AgentNodes.CheckRouted]: CheckRoutedParams;
  [AgentNodes.AimAtTarget]: AimAtTargetParams;
  [AgentNodes.FollowLeader]: FollowLeaderParams;
  [AgentNodes.Idle]: Record<string, never>;
}

export type AgentTreeDef =
  | { type: "selector"; children: AgentTreeDef[] }
  | { type: "sequence"; children: AgentTreeDef[] }
  | {
      [K in keyof AgentNodeParamsMap]: {
        type: K;
        params?: AgentNodeParamsMap[K];
      };
    }[keyof AgentNodeParamsMap];

export type AgentNodeFactoryMap = {
  [K in keyof AgentNodeParamsMap]: (
    params: AgentNodeParamsMap[K],
  ) => BTNode<AgentContext>;
};

export type AgentNodeParamKey = AgentNodeId;
