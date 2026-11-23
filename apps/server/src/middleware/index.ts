import express, { Application } from "express";
import swaggerUi from "swagger-ui-express";

import { healthCheck, rootRoute } from "@/lib/express";
import { rawJSONDocs, swaggerSetup } from "@/lib/openapi";
import { gameRouter } from "@/routes/api.routes";

import { corsMiddleware } from "./cors";
import { globalErrorHandler } from "./errors";
import { requestLogger } from "./http-request-logger";
import { requestMetadata } from "./http-request-metadata";

export function initializeMiddlewares(app: Application): void {
  app.use(corsMiddleware);
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static("public"));

  app.get("/health", healthCheck);
  app.get("/", rootRoute);

  app.use("/api-docs", swaggerUi.serve, swaggerSetup());
  app.get("/api-docs.json", rawJSONDocs);

  app.use(requestMetadata);
  app.use(requestLogger);

  app.use("/api", gameRouter);

  app.use(globalErrorHandler);
}
