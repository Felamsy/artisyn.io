"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toError, type QueryState } from "./types";

interface QueryResult<T> {
  key: string;
  data: T | null;
  error: Error | null;
}

export function useQuery<T>(
  queryKey: string,
  fetcher: () => Promise<T>
): QueryState<T> {
  const [result, setResult] = useState<QueryResult<T> | null>(null);
  const requestIdRef = useRef(0);

  const fetchOnce = useCallback(async (): Promise<QueryResult<T>> => {
    try {
      const data = await fetcher();
      return { key: queryKey, data, error: null };
    } catch (err) {
      return { key: queryKey, data: null, error: toError(err) };
    }
  }, [fetcher, queryKey]);

  useEffect(() => {
    let cancelled = false;
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    (async () => {
      const next = await fetchOnce();
      if (!cancelled && requestIdRef.current === requestId) {
        setResult(next);
      }
    })();

    return () => {
      cancelled = true;
      requestIdRef.current += 1;
    };
  }, [fetchOnce]);

  const refetch = useCallback(async (): Promise<void> => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setResult(null);

    const next = await fetchOnce();
    if (requestIdRef.current === requestId) {
      setResult(next);
    }
  }, [fetchOnce]);

  const isCurrent = result !== null && result.key === queryKey;

  return {
    data: isCurrent ? result.data : null,
    isLoading: !isCurrent,
    error: isCurrent ? result.error : null,
    refetch,
  };
}
