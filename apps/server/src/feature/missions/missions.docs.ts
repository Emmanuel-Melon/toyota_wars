import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { HttpStatus } from "@/lib/http/http.status";
import {
  defineApiResource,
  registerJsonApiSchemas,
  registerRoutes,
} from "@/lib/openapi/openapi.core";
import type { PathDefinition } from "@/lib/openapi/openapi.types";

import { missionsApi } from "./missions.routes";
import {
  getMissionsQuerySchema,
  missionsInsertSchema,
  missionsSelectSchema,
} from "./missions.types";

export const missionsRegistry = new OpenAPIRegistry();

const missionApiResource = defineApiResource({
  select: missionsSelectSchema,
  insert: missionsInsertSchema,
});

export const MissionApiSchemas = registerJsonApiSchemas({
  registry: missionsRegistry,
  resourceType: "mission",
  pascalName: "Mission",
  schemas: missionApiResource,
});

const missionPaths: PathDefinition[] = [
  {
    handlerName: "getMissionsController",
    method: "get",
    path: missionsApi.path,
    summary: "Get all missions",
    description:
      "Returns a paginated collection of campaign missions, sorted by campaign order by default.",
    requestQuery: getMissionsQuerySchema,
    successStatus: HttpStatus.SUCCESS,
    successSchema: MissionApiSchemas.colResSchema,
    errorCodes: [],
  },
  {
    handlerName: "getMissionByIdController",
    method: "get",
    path: `${missionsApi.path}/{id}`,
    summary: "Get mission by ID",
    description:
      "Returns a single mission by its slug ID (e.g. first-contact).",
    requestParams: z.object({
      id: z.string().openapi({ example: "first-contact" }),
    }),
    successStatus: HttpStatus.SUCCESS,
    successSchema: MissionApiSchemas.singleResSchema,
    errorCodes: [404],
  },
];

registerRoutes({
  registry: missionsRegistry,
  defaultTag: "Missions v1",
  routes: missionPaths,
});

missionsRegistry.register("GetMissionsParams", getMissionsQuerySchema);
