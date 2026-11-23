import dotenv from "dotenv";

import { DatabaseConfigSchema } from "./config.types";

dotenv.config();

export const dbConfig = DatabaseConfigSchema.parse({
  postgres: {
    url:
      process.env.DATABASE_URL || "postgres://postgres@localhost:5432/postgres",
  },
});
