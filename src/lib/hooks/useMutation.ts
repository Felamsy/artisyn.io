"use client";

import { useCallback, useState } from "react";
import { toError, type MutationState } from "./types";

export function useMutation<TArgs, TResult>(
  mutator: (args: TArgs) => Promise<TResult>
): MutationState<TArgs, TResult> {
  const [data, setData] = useState<TResult | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (args: TArgs): Promise<TResult> => {
      setIsPending(true);
      setError(null);

      try {
        const result = await mutator(args);
        setData(result);
        setIsPending(false);
        return result;
      } catch (err) {
        const normalized = toError(err);
        setError(normalized);
        setIsPending(false);
        throw normalized;
      }
    },
    [mutator]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsPending(false);
  }, []);

  return { data, isPending, error, mutate, reset };
}
