import { Request, Response } from "express";

import { toHttpError } from "@/lib/drizzle/drizzle.http";
import { matchSingle } from "@/lib/drizzle/results/results.single";
import { asyncHandler } from "@/lib/express/express.async-handler";
import { parseQueryOptions } from "@/lib/express/express.query";
import { sendSuccessResponse } from "@/lib/express/express.response";
import { HttpStatus } from "@/lib/http/http.status";

import { TANK_SORTABLE_FIELDS, SerializedTank } from "../tanks.config";
import { findTank, findTanks } from "../operations/tanks.find";

export const TankControllers = {
  getTanks: asyncHandler(async (req: Request, res: Response) => {
    const queryOptions = parseQueryOptions(req, {
      sortableFields: TANK_SORTABLE_FIELDS,
      defaultSort: "name",
    });

    const result = await findTanks(queryOptions);
    const total = result.count;
    const totalPages = Math.ceil(total / (queryOptions.limit ?? 10));

    return sendSuccessResponse(
      req,
      res,
      {
        data: result.data,
        serializerConfig: SerializedTank,
        type: "collection",
      },
      {
        status: HttpStatus.SUCCESS,
        additionalMeta: {
          total,
          page: queryOptions.page,
          limit: queryOptions.limit,
          totalPages,
          availableFilters: {},
          sortOptions: {
            fields: TANK_SORTABLE_FIELDS,
            default: queryOptions.sortBy,
            direction: queryOptions.sortOrder,
          },
        },
      },
    );
  }),

  getTankById: asyncHandler(async (req: Request, res: Response) => {
    const tankId = req.params.id as string;
    const tank = matchSingle(await findTank("id", tankId), {
      ok: (data) => data,
      err: (error) => {
        throw toHttpError(error, {
          notFound: "Tank blueprint not found",
        });
      },
    });

    return sendSuccessResponse(
      req,
      res,
      {
        data: tank,
        serializerConfig: SerializedTank,
        type: "single",
      },
      {
        status: HttpStatus.SUCCESS,
      },
    );
  }),
};