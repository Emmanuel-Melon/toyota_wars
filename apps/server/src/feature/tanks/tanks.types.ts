import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { InferSelectModel } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { BTNode } from "@/lib/behavior-tree/behavior-tree.core";
import { dbQueryOptionsSchema } from "@/types/query-options";

import { tanksSchema } from "./tanks.schema";
import { TankNodes } from "./tanks.config";

extendZodWithOpenApi(z);

export type Tank = InferSelectModel<typeof tanksSchema>;

const tankColumnOverrides = {
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  personality: z.string().min(1),
  traits: z.object({ aggression: z.number(), caution: z.number() }),
  health: z.number().int().nonnegative(),
  speed: z.number().nonnegative(),
  fireRange: z.number().nonnegative(),
  fightingDistance: z.number().nonnegative(),
  behaviorTree: z.record(z.string(), z.unknown()),
};

export const tanksSelectSchema = createSelectSchema(
  tanksSchema,
  tankColumnOverrides,
).openapi({
  title: "Tank",
  description: "AI tank blueprint: combat stats, traits, and behavior tree",
});

export const tanksInsertSchema = createInsertSchema(
  tanksSchema,
  tankColumnOverrides,
).openapi({
  title: "CreateTankRequest",
});

export const getTanksQuerySchema = dbQueryOptionsSchema.extend({
  sortBy: z.enum(["name", "health", "speed", "createdAt"]).default("name"),
});

export type GetTanksParams = z.infer<typeof getTanksQuerySchema>;
export type NewTank = z.infer<typeof tanksInsertSchema>;

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