import dotenv from "dotenv";

import { IServerConfig, ServerConfigSchema } from "./config.types";
import { dbConfig } from "./database.config";

export { dbConfig };

dotenv.config();

export const serverConfig = ServerConfigSchema.parse({
  port: Number(process.env.PORT) || 3000,
  env: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV !== "production",
  hostname: process.env.HOSTNAME || "localhost",
  protocol: process.env.NODE_ENV === "production" ? "https" : "http",
  baseUrl: process.env.BASE_URL || "http://localhost:3000",
  endpoints: {
    api: "/api",
    docs: "/docs",
    openApiSpec: "/api-docs",
    health: "/health",
  },
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : undefined,
  shutdownTimeout: 5000,
  trustProxy: process.env.TRUST_PROXY || "loopback",
  environment: process.env.NODE_ENV === "production" ? "production" : "development",
  clientUrls: process.env.CLIENT_URLS
    ? process.env.CLIENT_URLS.split(",")
        .map((url) => url.trim())
        .filter(Boolean)
    : undefined,
}) satisfies IServerConfig;

const config = {
  db: dbConfig,
  server: serverConfig,
};

export { config };
export default config;

export const isDev = process.env.NODE_ENV !== "production";

export const apiServers = [
  {
    url: `http://localhost:${serverConfig.port}${serverConfig.endpoints.api}`,
    description: "Local development server",
  },
];
