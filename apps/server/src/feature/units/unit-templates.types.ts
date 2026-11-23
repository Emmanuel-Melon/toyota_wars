// apps/api/src/modules/units/unit-templates.types.ts
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { personalitySchema } from "../missions/missions.types";
import { unitTemplatesSchema } from "./unit-templates.schema";

extendZodWithOpenApi(z);

// Adjust fields to match your exact VehiclePalette definition in ../palettes
export const vehiclePaletteSchema = z.object({
  primary: z.string(),
  secondary: z.string().optional(),
  accent: z.string().optional(),
});

export const unitPalettesSchema = z.object({
  ally: z.array(vehiclePaletteSchema).min(1),
  enemy: z.array(vehiclePaletteSchema).min(1),
});

const unitTemplateColumnOverrides = {
  id: z.string().regex(/^[a-z0-9-]+$/),
  maxHealth: z.number().int().positive(),
  damageScale: z.number().positive(),
  traits: personalitySchema,
  palettes: unitPalettesSchema,
};

export const unitTemplatesSelectSchema = createSelectSchema(
  unitTemplatesSchema,
  unitTemplateColumnOverrides,
).openapi({
  title: "UnitTemplate",
  description: "Vehicle hull stats, default AI personality traits, and team color palettes",
});

export const unitTemplatesInsertSchema = createInsertSchema(
  unitTemplatesSchema,
  unitTemplateColumnOverrides,
).openapi({
  title: "CreateUnitTemplateRequest",
});

export type VehiclePalette = z.infer<typeof vehiclePaletteSchema>;
export type UnitPalettes = z.infer<typeof unitPalettesSchema>;
export type UnitTemplate = z.infer<typeof unitTemplatesSelectSchema>;
export type NewUnitTemplate = z.infer<typeof unitTemplatesInsertSchema>;