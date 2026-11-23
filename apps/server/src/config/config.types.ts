import { z } from "zod";

export const ServerEndpointsSchema = z.object({
  api: z.string().min(1, "API endpoint is required"),
  docs: z.string().min(1, "Docs endpoint is required"),
  openApiSpec: z.string().min(1, "OpenAPI spec endpoint is required"),
  health: z.string().min(1, "Health check endpoint is required"),
});

export const ServerConfigSchema = z.object({
  port: z.number().int().min(1).max(65535),
  env: z.string().min(1, "Environment is required"),
  isProduction: z.boolean(),
  isDevelopment: z.boolean(),
  hostname: z.string().min(1, "Hostname is required"),
  protocol: z.enum(["http", "https"]),
  baseUrl: z.string().url("Base URL must be a valid URL"),
  endpoints: ServerEndpointsSchema,
  corsOrigins: z.preprocess(
    (val) =>
      typeof val === "string" ? val.split(",").map((s) => s.trim()) : val,
    z
      .array(z.string().url())
      .default(["http://localhost:5173", "http://localhost:5174"]),
  ),
  shutdownTimeout: z.number().int().min(0),
  trustProxy: z.union([z.string(), z.number()]),
  environment: z.string(),
  clientUrls: z.preprocess(
    (val) =>
      typeof val === "string" ? val.split(",").map((s) => s.trim()) : val,
    z.array(z.string().url()).default(["http://localhost:5173"]),
  ),
});

export const PostgresConfigSchema = z.object({
  url: z.string().url("PostgreSQL URL must be a valid URL"),
});

export const DatabaseConfigSchema = z.object({
  postgres: PostgresConfigSchema,
});

export type IServerEndpoints = z.infer<typeof ServerEndpointsSchema>;
export type IServerConfig = z.infer<typeof ServerConfigSchema>;
export type IDatabaseConfig = z.infer<typeof DatabaseConfigSchema>;
