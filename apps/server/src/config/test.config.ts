import dotenv from "dotenv";

import {
  DatabaseConfigSchema,
  IDatabaseConfig,
  IServerConfig,
  ServerConfigSchema,
} from "./config.types";

dotenv.config();

export const testServerConfig = ServerConfigSchema.parse({
  port: 3001,
  env: "test",
  isProduction: false,
  isDevelopment: false,
  hostname: "localhost",
  protocol: "http",
  baseUrl: "http://localhost:3001",
  endpoints: {
    api: "/api",
    docs: "/docs",
    openApiSpec: "/api-docs",
    health: "/health",
  },
  corsOrigins: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3001",
    "http://0.0.0.0:3001",
  ],
  shutdownTimeout: 5000,
  trustProxy: 0,
  environment: "test",
}) satisfies IServerConfig;

export const testDbConfig = DatabaseConfigSchema.parse({
  postgres: {
    url:
      process.env.TEST_DATABASE_URL ||
      "postgres://postgres@localhost:5432/toyota_wars_test_db",
  },
}) satisfies IDatabaseConfig;

const testConfig = {
  server: testServerConfig,
  db: testDbConfig,
};

export { testConfig };
export default testConfig;

export const isTest = true;

export const testCorsOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];
