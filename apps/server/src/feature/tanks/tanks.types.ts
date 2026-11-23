import { InferSelectModel } from "drizzle-orm";
import { tanksSchema } from "./tanks.schema";
// src/modules/tanks/tanks.types.ts
import { BTNode } from "@/lib/behavior-tree/behavior-tree.core";
import { TankNodes } from "./tanks.config";

export type Tank = InferSelectModel<typeof tanksSchema>;

export type TankColumn = typeof tanksSchema._.columns;
export type TankColumnKey = keyof TankColumn;

export type TankSortField = "name" | "health" | "speed" | "createdAt";

export interface TankTraits {
  aggression: number;
  caution: number;
}

export type TreeDefType = "selector" | "sequence" | string;

export interface Vector2D {
  x: number;
  y: number;
}

export interface TankContext {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  rotation: number; // in radians
  targetId?: string | null;
  targetPosition?: Vector2D | null;
  leaderId?: string | null;
  leaderPosition?: Vector2D | null;
  health: number;
  maxHealth: number;
  isRetreating: boolean;
  isRouted: boolean;
  dt: number;
  time: number;
  // World query hooks injected by the server simulation service
  getTankById?: (id: string) => TankContext | undefined;
  getTargetPosition?: () => Vector2D | null;
}

export type TankNodeKey = (typeof TankNodes)[keyof typeof TankNodes];

export type NodeParams = {
  [TankNodes.CheckTargetInRange]: { range: number };
  [TankNodes.CheckAligned]: { maxOffsetRad: number };
  [TankNodes.Chase]: { standoff: number };
  [TankNodes.StandoffCombat]: {
    fightingDistance?: number;
    retreatDistance?: number;
    approachSpeed?: number;
  };
  [TankNodes.Flank]: {
    orbitRadius: number;
    orbitSpeed: number;
    fireRange: number;
  };
  [TankNodes.CheckLeaderBeyond]: { distance: number };
  [TankNodes.FollowLeader]: { arriveRadius?: number; slowRadius?: number };
};

export type TreeDef =
  | { type: "selector"; children: TreeDef[] }
  | { type: "sequence"; children: TreeDef[] }
  | {
      [K in keyof NodeParams]: { type: K; params: NodeParams[K] };
    }[keyof NodeParams]
  | {
      [K in Exclude<TankNodeKey, keyof NodeParams>]: { type: K; params?: never };
    }[Exclude<TankNodeKey, keyof NodeParams>];

export type NodeFactoryMap = {
  [K in TankNodeKey]: (params: any) => BTNode<TankContext>;
};

export const TANK_INTENT = {
  ATTACK: "attack",
  RETREAT: "retreat",
  FLANK: "flank",
  FOLLOW_LEADER: "follow_leader",
  PATROL: "patrol",
} as const;

export type TankIntent = (typeof TANK_INTENT)[keyof typeof TANK_INTENT];