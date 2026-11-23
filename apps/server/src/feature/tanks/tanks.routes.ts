import { Router } from "express";

import type { ApiManifest } from "@/routes/api.types";

import { TankControllers } from "./controller/tanks.controller";

const tanksRouter = Router();

tanksRouter.get("/", TankControllers.getTanks);
tanksRouter.get("/:id", TankControllers.getTankById);

export const tanksApi: ApiManifest = {
  path: "/v1/tanks",
  router: tanksRouter,
};
