"use client";

import { useCallback } from "react";
import {
  listJobs,
  type Job,
  type JobsListResponse,
  type ListJobsParams,
} from "@/lib/api/jobs";
import { type QueryState } from "./types";
import { useQuery } from "./useQuery";

export function useJobs<T = Job>(
  params: ListJobsParams = {}
): QueryState<JobsListResponse<T>> {
  const queryKey = JSON.stringify(params);

  const fetcher = useCallback(
    () => listJobs<T>(JSON.parse(queryKey) as ListJobsParams),
    [queryKey]
  );

  return useQuery(queryKey, fetcher);
}
