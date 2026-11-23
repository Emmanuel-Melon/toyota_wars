import type {
  ApiCollection,
  JsonApiCollectionResponse,
  JsonApiSingleResponse,
  ApiResource,
  UnpackOptions,
} from "./api.types";
import { createApiClient, AxiosApiClient } from "../axios";
import { createUnpackError } from "./api.errors";

/**
 * Header the API's `requireIdempotencyKey()` reads. A repeated request carrying
 * the same key replays the stored response instead of re-running the handler.
 * Must stay in sync with `IDEMPOTENCY_HEADER` in
 * `apps/api/src/lib/idempotency/idempotency.middleware.ts` and with the CORS
 * `allowedHeaders` list.
 */
export const IDEMPOTENCY_HEADER = "Idempotency-Key";

export abstract class BaseApiClient {
  protected readonly defaultHeaders = {
    "Content-Type": "application/json",
  };

  constructor(protected readonly api: AxiosApiClient = createApiClient()) {}

  /**
   * Merges an idempotency key into a request's headers. Pass the key through
   * from the mutation that mints it — see `useAppMutation`'s `idempotent` flag.
   */
  protected withIdempotencyKey(idempotencyKey?: string) {
    return idempotencyKey
      ? { ...this.defaultHeaders, [IDEMPOTENCY_HEADER]: idempotencyKey }
      : this.defaultHeaders;
  }

  protected unpackSingle<T extends object, M>(
    response: JsonApiSingleResponse<T, M>,
    options: UnpackOptions,
  ): ApiResource<T, M> {
    if (!response.data?.attributes) {
      throw createUnpackError(`${options.errMsg}: missing attributes`);
    }

    return {
      data: response.data.attributes,
      metadata: response.metadata ?? ({} as M),
    };
  }

  protected unpackCollection<T, M>(
    response: JsonApiCollectionResponse<T, M>,
    options: UnpackOptions,
  ): ApiCollection<T, M> {
    if (!response.data || !Array.isArray(response.data)) {
      throw createUnpackError(`${options.errMsg}: missing data array`);
    }

    return {
      data: response.data.map((item) => item.attributes),
      metadata: response.metadata ?? ({} as M),
    };
  }
}
