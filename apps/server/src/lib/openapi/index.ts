import { Request, RequestHandler, Response } from "express";
import {
  extendZodWithOpenApi,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import swaggerUi from "swagger-ui-express";
import { z } from "zod";

import { apiServers } from "@/config";
import { catalogRegistry } from "@/feature/catalog/catalog.docs";
import { missionsRegistry } from "@/feature/missions/missions.docs";
import { tanksRegistry } from "@/feature/tanks/tanks.docs";

import { expressRegistry } from "../express/express.schema";

extendZodWithOpenApi(z);

const registries = [
  missionsRegistry,
  catalogRegistry,
  tanksRegistry,
  expressRegistry,
];

const definitions = registries.flatMap((r) => r.definitions);
const generator = new OpenApiGeneratorV3(definitions);

export const openApiSpec = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    title: "Toyota Wars API",
    version: "1.0.0",
    description: "Mission, catalog and tank simulation API for Toyota Wars.",
  },
  servers: apiServers,
});

export const rawJSONDocs = (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.json(openApiSpec);
};

export const swaggerSetup = () => {
  return [
    swaggerUi.serve as unknown as RequestHandler,
    swaggerUi.setup(openApiSpec, {
      explorer: true,
      customCss: ".swagger-ui .info { margin: 20px 0 }",
    }) as unknown as RequestHandler,
  ] as RequestHandler[];
};
