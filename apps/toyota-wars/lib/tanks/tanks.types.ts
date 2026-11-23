// lib/tanks/tanks.types.ts
import * as THREE from "three";
import { TankNodes } from "./tanks.config";
import { BTNode } from "../behavior-tree/behavior-tree.core";
import type {
  Obstacle,
  TankDecision,
  TankLeader,
  TankThreat,
} from "../movement/movement.types";
import type { SquadOrderContext } from "../squad/squad.types";
import type { VehiclePlatform } from "../vehicles/vehicle.types";
import type { WeaponConfig } from "../weapons/weapon.types";

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

export interface TankNodeParamsMap {
  [TankNodes.CheckTargetAssigned]: CheckTargetAssignedParams;
  [TankNodes.CheckHasLeader]: CheckHasLeaderParams;
  [TankNodes.CheckTargetInRange]: CheckTargetInRangeParams;
  [TankNodes.CheckAligned]: CheckAlignedParams;
  [TankNodes.Chase]: ChaseParams;
  [TankNodes.StandoffCombat]: StandoffCombatParams;
  [TankNodes.FormationFire]: FormationFireParams;
  [TankNodes.Flank]: FlankParams;
  [TankNodes.LoSReposition]: LoSRepositionParams;
  [TankNodes.PinCover]: PinCoverParams;
  [TankNodes.Shoot]: ShootParams;
  [TankNodes.Patrol]: PatrolParams;
  [TankNodes.Flee]: FleeParams;
  [TankNodes.CheckLeaderBeyond]: CheckLeaderBeyondParams;
  [TankNodes.CheckRetreating]: CheckRetreatingParams;
  [TankNodes.CheckRouted]: CheckRoutedParams;
  [TankNodes.AimAtTarget]: AimAtTargetParams;
  [TankNodes.FollowLeader]: FollowLeaderParams;
  [TankNodes.Idle]: Record<string, never>;
}

export type TreeDef =
  | { type: "selector"; children: TreeDef[] }
  | { type: "sequence"; children: TreeDef[] }
  | {
      [K in keyof TankNodeParamsMap]: {
        type: K;
        params?: TankNodeParamsMap[K];
      };
    }[keyof TankNodeParamsMap];

export type NodeFactoryMap = {
  [K in keyof TankNodeParamsMap]: (
    p: TankNodeParamsMap[K],
  ) => BTNode<TankContext>;
};

export interface FormationState {
  standby: boolean;
}

export interface TankSenses {
  unitId: string;
  position: Readonly<THREE.Vector3>;
  heading: number;
  speed: number;
  delta: number;
  targetPosition: Readonly<THREE.Vector3> | null;
  lastKnownPosition: Readonly<THREE.Vector3> | null;
  blockingObstacle: Obstacle | null;
  lineOfSightClear: boolean;
  weaponOrigin: Readonly<THREE.Vector3>;
  obstacles: readonly Obstacle[];
  canFire: boolean;
  leader: TankLeader | null;
  isSquadLeader: boolean;
  formationOffset: readonly [number, number];
  home: Readonly<THREE.Vector3>;
  bound: number;
  threats: readonly TankThreat[];
  retreatActive: boolean;
  routed: boolean;
  canFireWhileMoving: boolean;
  health: number;
  targetDistance: number;
  enemiesNearby: number;
  alliesNearby: number;
  leaderDistance: number;
  leaderLeashDistance: number;
  vehicle: VehiclePlatform;
  weapon: WeaponConfig;
}

export interface TankContext extends TankSenses {
  decision: TankDecision;
  formationState: FormationState;
  squadOrder: SquadOrderContext;
  damagedNeighborsCount: number;
  retreatingNeighborsCount: number;
}
