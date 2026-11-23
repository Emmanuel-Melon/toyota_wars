// apps/api/src/modules/catalog/catalog.types.ts
import { z } from "zod";
import { missionsSelectSchema, type Mission } from "../missions/missions.types";
// Assuming you create/import equivalent schemas for weapons & unit templates:
// import { weaponConfigSchema, type WeaponConfig } from "../weapons/weapons.types";
// import { unitTemplateSchema, type UnitTemplate } from "../units/units.types";

export const gameCatalogSchema = z.object({
  id: z.string().default("default"),
  version: z.string(),
  missions: z.array(missionsSelectSchema),
  weapons: z.record(z.string(), z.any()), // Replace z.any() with weaponConfigSchema
  unitTemplates: z.record(z.string(), z.any()), // Replace z.any() with unitTemplateSchema
});

export type GameCatalog = z.infer<typeof gameCatalogSchema>;

export interface CatalogResource {
  id: string;
  version: string;
  missions: Mission[];
  weapons: Record<string, unknown>;
  unitTemplates: Record<string, unknown>;
}