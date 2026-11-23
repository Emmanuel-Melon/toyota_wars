import type {
  MutationFunction,
  QueryKey,
  UseMutationOptions,
} from "@tanstack/react-query";

/**
 * Mutation variables extended with the key `useAppMutation` attaches when the
 * `idempotent` flag is set. The API client methods read it from there and send
 * it as the `Idempotency-Key` header.
 *
 * `void` is preserved rather than intersected. `void & { ... }` collapses to
 * `{ ... }`, which would make `undefined extends TVariables` false and so cost
 * the zero-argument `mutate()` signature that void mutations rely on.
 */
export type WithIdempotencyKey<TVariables> = TVariables extends void
  ? TVariables
  : TVariables & {
      idempotencyKey?: string;
    };

export type MutationMessages<TData, TError> = {
  success?: string | ((data: TData) => string);
  error: string | ((error: TError) => string);
};

export type CreateMutationOptions<TData, TError, TVariables> = Omit<
  UseMutationOptions<TData, TError, WithIdempotencyKey<TVariables>>,
  "onSuccess" | "onError" | "mutationFn"
> & {
  /**
   * Required rather than inherited-optional: the wrapper below calls it, and
   * `UseMutationOptions` declares it optional so callers can pass a bare
   * `mutationFn` via spread. Re-declaring it makes that a compile error at the
   * call site instead of a runtime `undefined` call here.
   */
  mutationFn: MutationFunction<TData, WithIdempotencyKey<TVariables>>;
  messages: MutationMessages<TData, TError>;
  invalidates?: QueryKey[] | ((variables: TVariables) => QueryKey[]);
  onSuccess?: (data: TData, variables: TVariables) => void;
  /**
   * Attach an `Idempotency-Key` to this mutation's requests.
   *
   * The key is minted once per call and reused across React Query's automatic
   * mutation retry, so a retried request replays the first response on the
   * server instead of running the handler twice. Opt in only for endpoints
   * whose side effects are not naturally idempotent — minting a Stripe session,
   * enqueueing a job that creates a row.
   *
   * A fresh call to `.mutate()` mints a fresh key, so an intentional second
   * submission counts as a new intent. Leave it off for updates and reads,
   * which are idempotent already and should not pay for the extra round trip.
   */
  idempotent?: boolean;
};
