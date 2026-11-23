// apps/api/src/modules/units/unit-templates.schema.ts
import {
  integer,
  jsonb,
  pgTable,
  real,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import type { UnitPalettes } from "./unit-templates.types";

export const unitTemplatesSchema = pgTable("unit_templates", {
  id: varchar("id", { length: 100 }).primaryKey(), // slug, e.g. "light", "medium", "heavy"
  label: varchar("label", { length: 100 }).notNull(),
  maxHealth: integer("max_health").notNull(),
  damageScale: real("damage_scale").notNull(),
  palettes: jsonb("palettes").$type<UnitPalettes>().notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const combinedUnitTemplatesSchema = {
  unitTemplatesSchema,
};