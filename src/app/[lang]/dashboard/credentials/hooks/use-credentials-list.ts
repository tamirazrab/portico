"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { credentialsParams } from "../params/credentials-params";
import type { CredentialsData } from "../types";

/**
 * Single source of truth for credentials list data.
 * Replaces duplicate queries in CredentialsListVM and CredentialsPaginationVM.
 */
/**
 * @deprecated Use useCredentials() instead. This will be removed in a future version.
 */
export function useCredentialsList() {
  return useCredentials();
}

export function useCredentials() {
  const trpc = useTRPC();
  const [params, setParams] = useQueryStates(credentialsParams);

  const query = useSuspenseQuery(trpc.credentials.getMany.queryOptions(params));

  const data = query.data as CredentialsData;

  return {
    credentials: data.items,
    page: data.page,
    totalPages: data.totalPages,
    isLoading: query.isFetching,
    isEmpty: data.items.length === 0,
    params,
    setParams,
  };
}

