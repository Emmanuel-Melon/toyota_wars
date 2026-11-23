// apps/api/src/modules/catalog/catalog.config.ts
import type { JsonApiResourceConfig } from "@/lib/express/express.types";
import type { CatalogResource } from "./catalog.types";

export const SerializedCatalog: JsonApiResourceConfig<CatalogResource> = {
  type: "catalog",
  attributes: (catalog: CatalogResource) => ({
    version: catalog.version,
    missions: catalog.missions,
    weapons: catalog.weapons,
    unitTemplates: catalog.unitTemplates,
  }),
};