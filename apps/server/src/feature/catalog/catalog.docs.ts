import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import { HttpStatus } from "@/lib/http/http.status";
import {
  defineApiResource,
  registerJsonApiSchemas,
  registerRoutes,
} from "@/lib/openapi/openapi.core";
import type { PathDefinition } from "@/lib/openapi/openapi.types";

import { gameCatalogSchema } from "./catalog.types";
import { catalogApi } from "./catalog.routes";

export const catalogRegistry = new OpenAPIRegistry();

const catalogApiResource = defineApiResource({
  select: gameCatalogSchema.omit({ id: true }),
});

export const CatalogApiSchemas = registerJsonApiSchemas({
  registry: catalogRegistry,
  resourceType: "catalog",
  pascalName: "Catalog",
  schemas: catalogApiResource,
});

const catalogPaths: PathDefinition[] = [
  {
    handlerName: "getCatalogController",
    method: "get",
    path: catalogApi.path,
    summary: "Get the full game catalog",
    description:
      "Returns missions, weapon configs, and unit templates in a single response.",
    successStatus: HttpStatus.SUCCESS,
    successSchema: CatalogApiSchemas.singleResSchema,
    errorCodes: [],
  },
];

registerRoutes({
  registry: catalogRegistry,
  defaultTag: "Catalog v1",
  routes: catalogPaths,
});
