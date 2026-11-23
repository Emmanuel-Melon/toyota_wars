// apps/api/src/modules/weapons/weapons.schema.ts
import {
  integer,
  jsonb,
  pgTable,
  real,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import type {
  WeaponAudio,
  WeaponExplosion,
  WeaponMuzzle,
  WeaponMuzzleEmitter,
  WeaponProjectile,
  WeaponVisual,
} from "./weapons.types";

export const weaponsSchema = pgTable("weapons", {
  id: varchar("id", { length: 100 }).primaryKey(), // slug, e.g. "dshk", "zu23", "type63"
  label: varchar("label", { length: 100 }).notNull(),
  mechanism: varchar("mechanism", { length: 50 }).notNull(), // "projectile" | "rocket"

  // Combat & AI tuning parameters
  directSuppression: real("direct_suppression").notNull(),
  indirectFirepower: real("indirect_firepower").notNull(),
  preferredRange: real("preferred_range").notNull(),
  engagementRange: real("engagement_range").notNull(),
  cooldown: real("cooldown").notNull(),
  spread: real("spread").notNull(),
  recoil: real("recoil").notNull(),
  ammoCost: integer("ammo_cost").default(1).notNull(),

  // Nested physics, audio & Three.js visual configs
  muzzle: jsonb("muzzle").$type<WeaponMuzzle>().notNull(),
  muzzles: jsonb("muzzles").$type<WeaponMuzzleEmitter[]>(), // optional multi-barrel offsets (e.g. ZU-23)
  projectile: jsonb("projectile").$type<WeaponProjectile>().notNull(),
  audio: jsonb("audio").$type<WeaponAudio>().notNull(),
  visual: jsonb("visual").$type<WeaponVisual>().notNull(),
  explosion: jsonb("explosion").$type<WeaponExplosion>(), // optional, used by rockets like Type 63

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const combinedWeaponsSchema = {
  weaponsSchema,
};