import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { dbConfig } from "@/config";
import { combinedMissionsSchema } from "@/feature/missions/missions.schema";
import { combinedTanksSchema } from "@/feature/tanks/tanks.schema";
import { combinedUnitTemplatesSchema } from "@/feature/units/unit-templates.schema";
import { combinedWeaponsSchema } from "@/feature/weapons/weapons.schema";

const pool = new Pool({
  connectionString: dbConfig.postgres.url,
});

export const db = drizzle(pool, {
  schema: {
    ...combinedMissionsSchema,
    ...combinedTanksSchema,
    ...combinedUnitTemplatesSchema,
    ...combinedWeaponsSchema,
  },
});

export type Database = typeof db;

export const closeDb = async () => {
  await pool.end();
};
