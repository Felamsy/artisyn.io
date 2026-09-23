"use client";

import { useCallback } from "react";
import {
  getProfile,
  saveProfile,
  type ProfileResponse,
} from "@/lib/api/profile";
import { type MutationState, type QueryState } from "./types";
import { useMutation } from "./useMutation";
import { useQuery } from "./useQuery";

export function useProfile(): QueryState<ProfileResponse> {
  const fetcher = useCallback(() => getProfile(), []);
  return useQuery("profile", fetcher);
}

export function useSaveProfile(): MutationState<object, ProfileResponse> {
  const mutator = useCallback((payload: object) => saveProfile(payload), []);
  return useMutation(mutator);
}
