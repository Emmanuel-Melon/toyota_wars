import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { dbQueryOptionsSchema } from "@/types/query-options";

import { missionsSchema } from "./missions.schema";

extendZodWithOpenApi(z);

/*
 * MISSION DEFINITION SCHEMAS (mirrors toyota-wars/lib/missions/missions.types.ts)
 */

export const vec2Schema = z.object({ x: z.number(), z: z.number() });

export const personalitySchema = z.object({
  aggression: z.number().min(0).max(1),
  caution: z.number().min(0).max(1),
});

export const teamSchema = z.enum(["ally", "enemy"]);

export const initialOrderSchema = z.enum([
  "attack",
  "follow",
  "flee",
  "patrol",
]);

export const spawnTriggerSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("start") }),
  z.object({ type: z.literal("time"), atSeconds: z.number().nonnegative() }),
  z.object({
    type: z.literal("squadDestroyed"),
    squadId: z.string(),
    delaySeconds: z.number().nonnegative().default(0),
  }),
]);

export const squadUnitSchema = z.object({
  template: z.string().min(1),
  personality: personalitySchema.optional(),
  isLeader: z.boolean().default(false),
});

export const squadSchema = z.object({
  id: z.string(),
  team: teamSchema,
  units: z.array(squadUnitSchema).min(1),
  spawnPoints: z.array(vec2Schema).min(1),
  trigger: spawnTriggerSchema.default({ type: "start" }),
  personality: personalitySchema.default({ aggression: 0.5, caution: 0.5 }),
  initialOrder: initialOrderSchema.default("patrol"),
});

const objectiveBaseSchema = z.object({
  id: z.string(),
  title: z.string(),
  required: z.boolean().default(true),
  hidden: z.boolean().default(false),
});

export const objectiveSchema = z.discriminatedUnion("type", [
  objectiveBaseSchema.extend({
    type: z.literal("destroyCount"),
    params: z.object({
      team: teamSchema.default("enemy"),
      count: z.number().int().positive(),
    }),
  }),
  objectiveBaseSchema.extend({
    type: z.literal("destroySquad"),
    params: z.object({
      squadId: z.string(),
      leaderOnly: z.boolean().default(false),
    }),
  }),
  objectiveBaseSchema.extend({
    type: z.literal("survive"),
    params: z.object({ seconds: z.number().positive() }),
  }),
  objectiveBaseSchema.extend({
    type: z.literal("keepAlive"),
    params: z.object({
      squadId: z.string(),
      minAlive: z.number().int().positive(),
    }),
  }),
]);

export const failConditionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("playerDestroyed") }),
  z.object({ type: z.literal("timeLimit"), seconds: z.number().positive() }),
]);

export const roadConfigSchema = z.object({
  waypoints: z.array(vec2Schema).min(2),
  width: z.number().positive().default(12),
});

export const missionArenaSchema = z.object({
  levelId: z.string().optional(),
  seed: z.number().int(),
  size: z.number().positive(),
  obstacleDensity: z.number().min(0).max(1),
  playerSpawn: vec2Schema,
  heading: z.number().optional(),
  roads: roadConfigSchema.optional(),
});

export const missionRewardsSchema = z.object({
  xp: z.number().int().nonnegative(),
  unlocks: z.array(z.string()).default([]),
});

/*
 * DRIZZLE-GENERATED SCHEMAS (from PostgreSQL tables)
 */

const missionColumnOverrides = {
  id: z.string().regex(/^[a-z0-9-]+$/),
  difficulty: z.number().int().min(1).max(5),
  requires: z.array(z.string()),
  arena: missionArenaSchema,
  squads: z.array(squadSchema).min(1),
  objectives: z.array(objectiveSchema).min(1),
  failConditions: z.array(failConditionSchema).min(1),
  rewards: missionRewardsSchema,
};

export const missionsSelectSchema = createSelectSchema(
  missionsSchema,
  missionColumnOverrides,
).openapi({
  title: "Mission",
  description:
    "Campaign mission definition: arena, squads, objectives, fail conditions, and rewards",
});

export const missionsInsertSchema = createInsertSchema(
  missionsSchema,
  missionColumnOverrides,
).openapi({
  title: "CreateMissionRequest",
  description: "Request schema for creating a new mission",
});

export const getMissionsQuerySchema = dbQueryOptionsSchema.extend({
  sortBy: z
    .enum(["order", "title", "difficulty", "createdAt"])
    .default("order"),
});

/*
 * DOMAIN-RELATED TYPES
 */
export type Vec2 = z.infer<typeof vec2Schema>;
export type Squad = z.infer<typeof squadSchema>;
export type Objective = z.infer<typeof objectiveSchema>;
export type FailCondition = z.infer<typeof failConditionSchema>;
export type MissionArena = z.infer<typeof missionArenaSchema>;
export type MissionRewards = z.infer<typeof missionRewardsSchema>;
export type Mission = z.infer<typeof missionsSelectSchema>;
export type NewMission = z.infer<typeof missionsInsertSchema>;
export type GetMissionsParams = z.infer<typeof getMissionsQuerySchema>;

/*
 * DATABASE QUERY TYPES
 */
export type MissionColumn = typeof missionsSchema._.columns;
export type MissionColumnKey = keyof MissionColumn;
export type MissionSortField = GetMissionsParams["sortBy"];
