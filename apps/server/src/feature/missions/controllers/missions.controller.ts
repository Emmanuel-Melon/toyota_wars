import { Request, Response } from "express";

import { toHttpError } from "@/lib/drizzle/drizzle.http";
import { matchSingle } from "@/lib/drizzle/results/results.single";
import { asyncHandler } from "@/lib/express/express.async-handler";
import { parseQueryOptions } from "@/lib/express/express.query";
import { sendSuccessResponse } from "@/lib/express/express.response";
import { HttpStatus } from "@/lib/http/http.status";

import { MISSION_SORTABLE_FIELDS, SerializedMission } from "../missions.config";
import { findMission, findMissions } from "../operations/missions.find";

export const MissionControllers = {
  getMissions: asyncHandler(async (req: Request, res: Response) => {
    const queryOptions = parseQueryOptions(req, {
      sortableFields: MISSION_SORTABLE_FIELDS,
      defaultSort: "order",
    });

    const result = await findMissions(queryOptions);

    const total = result.count;
    const totalPages = Math.ceil(total / (queryOptions.limit ?? 10));

    return sendSuccessResponse(
      req,
      res,
      {
        data: result.data,
        serializerConfig: SerializedMission,
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
            fields: MISSION_SORTABLE_FIELDS,
            default: queryOptions.sortBy,
            direction: queryOptions.sortOrder,
          },
        },
      },
    );
  }),

  getMissionById: asyncHandler(async (req: Request, res: Response) => {
    const missionId = req.params.id as string;
    const mission = matchSingle(await findMission("id", missionId), {
      ok: (data) => data,
      err: (error) => {
        throw toHttpError(error, {
          notFound: "Mission not found",
        });
      },
    });

    return sendSuccessResponse(
      req,
      res,
      {
        data: mission,
        serializerConfig: SerializedMission,
        type: "single",
      },
      {
        status: HttpStatus.SUCCESS,
      },
    );
  }),
};
