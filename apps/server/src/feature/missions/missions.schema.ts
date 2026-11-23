import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import type {
  FailCondition,
  MissionArena,
  MissionRewards,
  Objective,
  Squad,
} from "./missions.types";

export const missionsSchema = pgTable("missions", {
  id: varchar("id", { length: 100 }).primaryKey(), // slug, e.g. "first-contact"
  schemaVersion: integer("schema_version").default(1).notNull(),
  order: integer("order").notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  briefing: text("briefing").notNull(),
  difficulty: integer("difficulty").notNull(),

  requires: jsonb("requires").$type<string[]>().default([]).notNull(),
  arena: jsonb("arena").$type<MissionArena>().notNull(),
  squads: jsonb("squads").$type<Squad[]>().notNull(),
  objectives: jsonb("objectives").$type<Objective[]>().notNull(),
  failConditions: jsonb("fail_conditions").$type<FailCondition[]>().notNull(),
  rewards: jsonb("rewards").$type<MissionRewards>().notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const combinedMissionsSchema = {
  missionsSchema,
};
