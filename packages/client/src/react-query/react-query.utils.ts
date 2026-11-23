import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import type {
  CreateMutationOptions,
  WithIdempotencyKey,
} from "./react-query.types";
import { toast } from "sonner";

export const useAppMutation = <TData, TError, TVariables>(
  options: CreateMutationOptions<TData, TError, TVariables>,
) => {
  const queryClient = useQueryClient();
  const { invalidates, onSuccess, messages, idempotent, mutationFn, ...rest } =
    options;

  /**
   * The key currently in flight, paired with the variables object it belongs to.
   *
   * React Query hands `mutationFn` the *same* variables reference when it
   * retries, so that identity is what separates a retry from a new intent.
   * Minting per attempt instead would defeat the purpose: the retry would carry
   * a different key and the server would run the handler again.
   */
  const idempotencyRef = useRef<{
    variables: WithIdempotencyKey<TVariables>;
    key: string;
  } | null>(null);

  return useMutation<TData, TError, WithIdempotencyKey<TVariables>>({
    ...rest,
    mutationFn: async (variables, context) => {
      if (!idempotent) return mutationFn(variables, context);

      if (idempotencyRef.current?.variables !== variables) {
        idempotencyRef.current = {
          variables,
          key: crypto.randomUUID(),
        };
      }

      return mutationFn(
        {
          ...variables,
          idempotencyKey: idempotencyRef.current.key,
        },
        context,
      );
    },
    onSuccess: (data, variables) => {
      const keys =
        typeof invalidates === "function"
          ? invalidates(variables)
          : invalidates;
      keys?.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key, exact: false }),
      );
      onSuccess?.(data, variables);
      if (messages.success) {
        const successMessage =
          typeof messages.success === "function"
            ? messages.success(data)
            : messages.success;
        toast(successMessage);
      }
    },
    onError: (error) => {
      const errorMessage =
        typeof messages.error === "function"
          ? messages.error(error)
          : messages.error;

      console.error(`Mutation Error:`, error);
      toast.error(errorMessage);
    },
  });
};
