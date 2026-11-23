import type { JsonApiError } from "./api.types";

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly errors: JsonApiError[];

  constructor(status: number, errors: JsonApiError[]) {
    super(errors[0]?.detail || "An unexpected API error occurred");

    this.name = "ApiClientError";
    this.status = status;
    this.errors = errors;
  }
}

export class TimeoutError extends ApiClientError {
  public readonly timeoutMs: number;

  constructor(ms: number) {
    super(504, []);

    this.name = "TimeoutError";
    this.message = `Request timed out after ${ms}ms`;
    this.timeoutMs = ms;
  }
}

export function createUnpackError(detail: string): ApiClientError {
  return new ApiClientError(502, [
    {
      id: crypto.randomUUID(),
      status: "502",
      code: "INVALID_RESPONSE",
      title: "Unexpected response",
      detail,
      metadata: { timestamp: new Date().toISOString() },
    },
  ]);
}
