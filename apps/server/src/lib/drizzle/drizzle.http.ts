// apps/api/src/lib/drizzle/drizzle.http.ts
import { HttpError } from "@/lib/http/http.error";
import { HttpStatus } from "@/lib/http/http.status";

import type { DbError } from "./drizzle.types";

export type ToHttpErrorOpts = {
  notFound?: string | HttpError | ((e: DbError) => HttpError);
  conflict?: string | HttpError | ((e: DbError) => HttpError);
  validation?: string | HttpError | ((e: DbError) => HttpError);
};

const resolveOverride = (
  err: DbError,
  override?: string | HttpError | ((e: DbError) => HttpError),
  defaultStatus?: (typeof HttpStatus)[keyof typeof HttpStatus],
): HttpError | undefined => {
  if (typeof override === "function") return override(err);
  if (typeof override === "string") {
    return defaultStatus ? new HttpError(defaultStatus, override) : undefined;
  }
  return override;
};

export const toHttpError = (
  err: DbError,
  opts?: ToHttpErrorOpts,
): HttpError => {
  switch (err.type) {
    case "NOT_FOUND": {
      return (
        resolveOverride(err, opts?.notFound, HttpStatus.NOT_FOUND) ??
        new HttpError(HttpStatus.NOT_FOUND, "Resource not found")
      );
    }
    case "CONFLICT": {
      return (
        resolveOverride(err, opts?.conflict, HttpStatus.CONFLICT) ??
        new HttpError(HttpStatus.CONFLICT, err.reason)
      );
    }
    case "VALIDATION_ERROR": {
      return (
        resolveOverride(err, opts?.validation, HttpStatus.BAD_REQUEST) ??
        new HttpError(HttpStatus.BAD_REQUEST, err.reason)
      );
    }
    case "DATABASE_ERROR": {
      return new HttpError(HttpStatus.INTERNAL_SERVER_ERROR, err.reason);
    }
  }
};
