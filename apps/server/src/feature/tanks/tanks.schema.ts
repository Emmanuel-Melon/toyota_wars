import {
  integer,
  jsonb,
  pgTable,
  real,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import type { TankTraits, TreeDef } from "./tanks.types";

export const tanksSchema = pgTable("tanks", {
  id: varchar("id", { length: 100 }).primaryKey(), // e.g., "heavy-tank-mk1"
  name: varchar("name", { length: 255 }).notNull(),
  personality: varchar("personality", { length: 50 }).notNull(), // "aggressive", "sniper", etc.
  traits: jsonb("traits").$type<TankTraits>().notNull(),
  
  // Combat stats
  health: integer("health").default(100).notNull(),
  speed: real("speed").default(1.0).notNull(),
  fireRange: real("fire_range").default(60).notNull(),
  fightingDistance: real("fighting_distance").default(55).notNull(),

  // Dynamic Behavior Tree JSON blob stored in DB!
  behaviorTree: jsonb("behavior_tree").$type<TreeDef>().notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const combinedTanksSchema = {
  tanksSchema,
};