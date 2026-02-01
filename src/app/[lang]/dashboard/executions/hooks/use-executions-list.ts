"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { executionsParams } from "../params/executions-params";
import type { ExecutionsData } from "../types";

/**
 * Single source of truth for executions list data.
 * Replaces duplicate queries in ExecutionsListVM and ExecutionsPaginationVM.
 */
/**
 * @deprecated Use useExecutions() instead. This will be removed in a future version.
 */
export function useExecutionsList() {
  return useExecutions();
}

export function useExecutions() {
  const trpc = useTRPC();
  const [params, setParams] = useQueryStates(executionsParams);

  const query = useSuspenseQuery(trpc.executions.getMany.queryOptions(params));

  const data = query.data as ExecutionsData;

  return {
    executions: data.items,
    page: data.page,
    totalPages: data.totalPages,
    isLoading: query.isFetching,
    isEmpty: data.items.length === 0,
    params,
    setParams,
  };
}

