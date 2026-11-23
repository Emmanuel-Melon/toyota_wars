import { RequestHandler, Router } from "express";

export type TimeUnit = "second" | "minute" | "hour" | "day";

export interface RateLimitRule {
  amount: number;
  limit: number;
  path: string;
  unit: TimeUnit;
}

export interface ApiManifest {
  middlewares?: RequestHandler[];
  path: string;
  router: Router;
}
