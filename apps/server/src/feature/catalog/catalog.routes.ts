// apps/api/src/modules/catalog/catalog.routes.ts
import { Router } from "express";

import type { ApiManifest } from "@/routes/api.types";
import { CatalogControllers } from "./controllers/catalog.controller";

const catalogRouter = Router();

catalogRouter.get("/", CatalogControllers.getCatalog);

export const catalogApi: ApiManifest = {
  path: "/v1/catalog",
  router: catalogRouter,
};