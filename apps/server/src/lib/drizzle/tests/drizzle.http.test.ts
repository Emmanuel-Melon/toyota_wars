import { describe, expect, it } from "vitest";

import { HttpError } from "@/lib/http/http.error";
import { HttpStatus } from "@/lib/http/http.status";

import { toHttpError } from "../drizzle.http";
import type { DbError } from "../drizzle.types";

const dbError = (
  type: DbError["type"],
  reason = "operation failed",
): DbError => ({ type, reason });

describe("toHttpError", () => {
  it("maps NOT_FOUND to 404 with a default message", () => {
    const err = toHttpError(dbError("NOT_FOUND"));
    expect(err).toBeInstanceOf(HttpError);
    expect(err.status).toBe(HttpStatus.NOT_FOUND);
    expect(err.message).toBe("Resource not found");
  });

  it("honors a string notFound override", () => {
    const err = toHttpError(dbError("NOT_FOUND"), {
      notFound: "Occasion not found",
    });
    expect(err.status).toBe(HttpStatus.NOT_FOUND);
    expect(err.message).toBe("Occasion not found");
  });

  it("honors an HttpError notFound override (keeps status, e.g. login 401)", () => {
    const err = toHttpError(dbError("NOT_FOUND"), {
      notFound: new HttpError(HttpStatus.UNAUTHORIZED, "Invalid credentials"),
    });
    expect(err.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(err.message).toBe("Invalid credentials");
    expect(err.status.statusCode).toBe(401);
  });

  it("honors a function notFound override", () => {
    const err = toHttpError(dbError("NOT_FOUND", "missing row"), {
      notFound: (e) => new HttpError(HttpStatus.NOT_FOUND, `gone: ${e.reason}`),
    });
    expect(err.status).toBe(HttpStatus.NOT_FOUND);
    expect(err.message).toBe("gone: missing row");
  });

  it("maps CONFLICT to 409 with the real reason", () => {
    const err = toHttpError(
      dbError("CONFLICT", "paid order(s) exist for its gift process"),
    );
    expect(err.status).toBe(HttpStatus.CONFLICT);
    expect(err.message).toBe("paid order(s) exist for its gift process");
  });

  it("honors a conflict override", () => {
    const err = toHttpError(dbError("CONFLICT"), {
      conflict: "already assigned",
    });
    expect(err.status).toBe(HttpStatus.CONFLICT);
    expect(err.message).toBe("already assigned");
  });

  it("maps VALIDATION_ERROR to 400 with the real reason", () => {
    const err = toHttpError(dbError("VALIDATION_ERROR", "name is required"));
    expect(err.status).toBe(HttpStatus.BAD_REQUEST);
    expect(err.message).toBe("name is required");
  });

  it("honors a validation override", () => {
    const err = toHttpError(dbError("VALIDATION_ERROR"), {
      validation: "invalid input",
    });
    expect(err.status).toBe(HttpStatus.BAD_REQUEST);
    expect(err.message).toBe("invalid input");
  });

  it("maps DATABASE_ERROR to 500 with the real reason", () => {
    const err = toHttpError(dbError("DATABASE_ERROR", "connection refused"));
    expect(err.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(err.message).toBe("connection refused");
  });

  it("keeps DATABASE_ERROR as 500 even when a notFound override is set", () => {
    const err = toHttpError(dbError("DATABASE_ERROR", "connection refused"), {
      notFound: "Occasion not found",
    });
    expect(err.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(err.message).toBe("connection refused");
  });
});
