import { Request, Response } from "express";
import { sql } from "drizzle-orm";

import { db } from "@/lib/drizzle";
import { HttpStatus } from "@/lib/http/http.status";

import { asyncHandler } from "./express.async-handler";
import {
  healthCheckSerializerConfig,
  welcomeResponseSerializerConfig,
} from "./express.config";
import { sendSuccessResponse } from "./express.response";
import type { HealthCheckResponse, WelcomeResponse } from "./express.types";

export const healthCheck = asyncHandler(async (req: Request, res: Response) => {
  let databaseStatus = "connected";
  let error: string | undefined;

  try {
    await db.execute(sql`SELECT 1`);
  } catch {
    databaseStatus = "unreachable";
    error = "Database is unreachable";
  }

  const healthy = databaseStatus === "connected";

  const response: HealthCheckResponse = {
    status: healthy ? "healthy" : "unhealthy",
    message: healthy ? "Server is running" : "Server is degraded",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    services: {
      database: databaseStatus,
    },
    error,
  };

  sendSuccessResponse(
    req,
    res,
    {
      data: response,
      serializerConfig: healthCheckSerializerConfig,
      type: "single",
    },
    {
      status: healthy ? HttpStatus.SUCCESS : HttpStatus.SERVICE_UNAVAILABLE,
    },
  );
});

export const rootRoute = asyncHandler(async (req: Request, res: Response) => {
  const response: WelcomeResponse = {
    message: "Toyota Wars API Server",
    documentation: "/api-docs",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/health",
      apiDocs: "/api-docs",
      apiBase: "/api",
    },
    status: "healthy",
    version: process.env.npm_package_version || "1.0.0",
  };

  sendSuccessResponse(
    req,
    res,
    {
      data: response,
      serializerConfig: welcomeResponseSerializerConfig,
      type: "single",
    },
    { status: HttpStatus.SUCCESS },
  );
});
