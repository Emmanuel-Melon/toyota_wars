import { Router } from "express";

import type { ApiManifest } from "@/routes/api.types";

import { MissionControllers } from "./controllers/missions.controller";

const missionsRouter = Router();

missionsRouter.get("/", MissionControllers.getMissions);
missionsRouter.get("/:id", MissionControllers.getMissionById);

export const missionsApi: ApiManifest = {
  path: "/v1/missions",
  router: missionsRouter,
};
