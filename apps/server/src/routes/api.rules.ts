import { Router } from "express";

import type { ApiManifest } from "@/routes/api.types";

export function useApiRouters(router: Router, manifests: ApiManifest[]) {
  manifests.forEach((api) => {
    const apiRouter = Router();

    if (api.middlewares?.length) {
      apiRouter.use(...api.middlewares);
    }

    apiRouter.use(api.router);
    router.use(api.path, apiRouter);
  });
}
