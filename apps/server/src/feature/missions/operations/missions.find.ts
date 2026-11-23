import { count, eq, ilike } from "drizzle-orm";

import { db } from "@/lib/drizzle";
import { getPaginationConfig } from "@/lib/drizzle/drizzle.query-builder";
import type { DbCollection, DbResult } from "@/lib/drizzle/drizzle.types";
import { toCollection } from "@/lib/drizzle/results/results.collection";
import { executeSingle } from "@/lib/drizzle/results/results.single";
import { DbQueryOptions } from "@/types/query-options";

import { missionsSchema } from "../missions.schema";
import {
  Mission,
  MissionColumn,
  MissionColumnKey,
  MissionSortField,
} from "../missions.types";

export const findMissions = async (
  options: DbQueryOptions<MissionSortField>,
): Promise<DbCollection<Mission>> => {
  const { limit, offset, orderBy } = getPaginationConfig(
    options,
    missionsSchema,
    "order",
  );

  const finalWhere = options.search
    ? ilike(missionsSchema.title, `%${options.search}%`)
    : undefined;

  const dataQuery = db.query.missionsSchema.findMany({
    where: finalWhere,
    orderBy,
    limit,
    offset,
  });

  const countQuery = db
    .select({ count: count() })
    .from(missionsSchema)
    .where(finalWhere);

  const [data, [{ count: totalCount }]] = await Promise.all([
    dataQuery,
    countQuery,
  ]);

  return toCollection(data, { overrideCount: totalCount });
};

export const findMission = <K extends MissionColumnKey>(
  field: K,
  value: MissionColumn[K]["_"]["data"],
): Promise<DbResult<Mission>> =>
  executeSingle(
    db.query.missionsSchema.findFirst({
      where: eq(missionsSchema[field], value),
    }),
  );
