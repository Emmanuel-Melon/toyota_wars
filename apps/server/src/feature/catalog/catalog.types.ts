import { z } from "zod";

import { missionsSelectSchema, type Mission } from "../missions/missions.types";
import { unitTemplatesSelectSchema } from "../units/unit-templates.types";
import { weaponsSelectSchema } from "../weapons/weapons.types";

export const gameCatalogSchema = z.object({
  id: z.string().default("default"),
  version: z.string(),
  missions: z.array(missionsSelectSchema),
  weapons: z.record(z.string(), weaponsSelectSchema),
  unitTemplates: z.record(z.string(), unitTemplatesSelectSchema),
});

export type GameCatalog = z.infer<typeof gameCatalogSchema>;

export interface CatalogResource {
  id: string;
  version: string;
  missions: Mission[];
  weapons: Record<string, unknown>;
  unitTemplates: Record<string, unknown>;
}
