import { count, eq, ilike } from "drizzle-orm";

import { db } from "@/lib/drizzle";
import { getPaginationConfig } from "@/lib/drizzle/drizzle.query-builder";
import type { DbCollection, DbResult } from "@/lib/drizzle/drizzle.types";
import { toCollection } from "@/lib/drizzle/results/results.collection";
import { executeSingle } from "@/lib/drizzle/results/results.single";
import { DbQueryOptions } from "@/types/query-options";

import { tanksSchema } from "../tanks.schema";
import { TankColumnKey, TankColumn, Tank, TankSortField } from "../tanks.types";

export const findTanks = async (
  options: DbQueryOptions<TankSortField>,
): Promise<DbCollection<Tank>> => {
  const { limit, offset, orderBy } = getPaginationConfig(
    options,
    tanksSchema,
    "name",
  );

  const finalWhere = options.search
    ? ilike(tanksSchema.name, `%${options.search}%`)
    : undefined;

  const dataQuery = db.query.tanksSchema.findMany({
    where: finalWhere,
    orderBy,
    limit,
    offset,
  });

  const countQuery = db
    .select({ count: count() })
    .from(tanksSchema)
    .where(finalWhere);

  const [data, [{ count: totalCount }]] = await Promise.all([
    dataQuery,
    countQuery,
  ]);

  return toCollection(data, { overrideCount: totalCount });
};

export const findTank = <K extends TankColumnKey>(
  field: K,
  value: TankColumn[K]["_"]["data"],
): Promise<DbResult<Tank>> =>
  executeSingle(
    db.query.tanksSchema.findFirst({
      where: eq(tanksSchema[field], value),
    }),
  );