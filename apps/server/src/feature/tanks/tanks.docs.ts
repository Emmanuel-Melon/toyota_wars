import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { HttpStatus } from "@/lib/http/http.status";
import {
  defineApiResource,
  registerJsonApiSchemas,
  registerRoutes,
} from "@/lib/openapi/openapi.core";
import type { PathDefinition } from "@/lib/openapi/openapi.types";

import { tanksApi } from "./tanks.routes";
import {
  getTanksQuerySchema,
  tanksInsertSchema,
  tanksSelectSchema,
} from "./tanks.types";

export const tanksRegistry = new OpenAPIRegistry();

const tankApiResource = defineApiResource({
  select: tanksSelectSchema,
  insert: tanksInsertSchema,
});

export const TankApiSchemas = registerJsonApiSchemas({
  registry: tanksRegistry,
  resourceType: "tank",
  pascalName: "Tank",
  schemas: tankApiResource,
});

const tankPaths: PathDefinition[] = [
  {
    handlerName: "getTanksController",
    method: "get",
    path: tanksApi.path,
    summary: "Get all tanks",
    description:
      "Returns a paginated collection of tank blueprints, sorted by name by default.",
    requestQuery: getTanksQuerySchema,
    successStatus: HttpStatus.SUCCESS,
    successSchema: TankApiSchemas.colResSchema,
    errorCodes: [],
  },
  {
    handlerName: "getTankByIdController",
    method: "get",
    path: `${tanksApi.path}/{id}`,
    summary: "Get tank by ID",
    description: "Returns a single tank blueprint by its slug ID.",
    requestParams: z.object({
      id: z.string().openapi({ example: "heavy-tank-mk1" }),
    }),
    successStatus: HttpStatus.SUCCESS,
    successSchema: TankApiSchemas.singleResSchema,
    errorCodes: [404],
  },
];

registerRoutes({
  registry: tanksRegistry,
  defaultTag: "Tanks v1",
  routes: tankPaths,
});

tanksRegistry.register("GetTanksParams", getTanksQuerySchema);
