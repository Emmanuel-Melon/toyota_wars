// apps/api/src/modules/catalog/operations/catalog.find.ts
import { asc } from "drizzle-orm";

import { db } from "@/lib/drizzle";
import { missionsSchema } from "../../missions/missions.schema";
import type { CatalogResource } from "../catalog.types";

export const getFullGameCatalog = async (): Promise<CatalogResource> => {
  const [missions, weaponsList, templatesList] = await Promise.all([
    db.query.missionsSchema.findMany({
      orderBy: [asc(missionsSchema.order)],
    }),
    db.query.weaponsSchema.findMany(),
    db.query.unitTemplatesSchema.findMany(),
  ]);

  const weapons = Object.fromEntries(weaponsList.map((w) => [w.id, w]));
  const unitTemplates = Object.fromEntries(templatesList.map((t) => [t.id, t]));

  return {
    id: "toyota-wars-v1",
    version: "1.0.0",
    missions,
    weapons,
    unitTemplates,
  };
};