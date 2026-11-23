import { Router } from "express";

import { catalogApi } from "@/feature/catalog/catalog.routes";
import { missionsApi } from "@/feature/missions/missions.routes";
import { tanksApi } from "@/feature/tanks/tanks.routes";
import { useApiRouters } from "@/routes/api.rules";

export const gameRouter = Router();

useApiRouters(gameRouter, [missionsApi, catalogApi, tanksApi]);
