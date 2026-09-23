"use client";

import { useCallback } from "react";
import {
  createApplication,
  getApplications,
  type Application,
  type CreateApplicationPayload,
} from "@/lib/api/applications";
import { type MutationState, type QueryState } from "./types";
import { useMutation } from "./useMutation";
import { useQuery } from "./useQuery";

export function useApplications(): QueryState<Application[]> {
  const fetcher = useCallback(() => getApplications(), []);
  return useQuery("applications", fetcher);
}

export function useCreateApplication(): MutationState<
  CreateApplicationPayload,
  Application
> {
  const mutator = useCallback(
    (payload: CreateApplicationPayload) => createApplication(payload),
    []
  );
  return useMutation(mutator);
}
