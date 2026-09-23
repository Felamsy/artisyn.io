export interface QueryState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface MutationState<TArgs, TResult> {
  data: TResult | null;
  isPending: boolean;
  error: Error | null;
  mutate: (args: TArgs) => Promise<TResult>;
  reset: () => void;
}

export function toError(error: unknown): Error {
  if (error instanceof Error) return error;
  if (typeof error === "string") return new Error(error);
  return new Error("An unexpected error occurred.");
}
