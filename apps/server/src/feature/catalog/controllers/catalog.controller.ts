// apps/api/src/modules/catalog/controllers/catalog.controller.ts
import { Request, Response } from "express";

import { asyncHandler } from "@/lib/express/express.async-handler";
import { sendSuccessResponse } from "@/lib/express/express.response";
import { HttpStatus } from "@/lib/http/http.status";

import { SerializedCatalog } from "../catalog.config";
import { getFullGameCatalog } from "../operations/catalog.find";

export const CatalogControllers = {
  getCatalog: asyncHandler(async (req: Request, res: Response) => {
    const catalog = await getFullGameCatalog();

    // Cache on CDN/browser for 5 minutes; serve stale while revalidating
    res.setHeader(
      "Cache-Control",
      "public, max-age=300, stale-while-revalidate=600",
    );

    return sendSuccessResponse(
      req,
      res,
      {
        data: catalog,
        serializerConfig: SerializedCatalog,
        type: "single",
      },
      {
        status: HttpStatus.SUCCESS,
      },
    );
  }),
};