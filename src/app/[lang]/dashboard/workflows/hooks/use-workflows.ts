"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { workflowsParams } from "../params/workflows-params";
import type { WorkflowsData } from "../types";

/**
 * Single source of truth for workflows list data.
 * Replaces duplicate queries in WorkflowsListVM and WorkflowsPaginationVM.
 */
export function useWorkflows() {
  const trpc = useTRPC();
  const [params, setParams] = useQueryStates(workflowsParams);

  const query = useSuspenseQuery(trpc.workflows.getMany.queryOptions(params));

  const data = query.data as WorkflowsData;

  return {
    workflows: data.items,
    page: data.page,
    totalPages: data.totalPages,
    isLoading: query.isFetching,
    isEmpty: data.items.length === 0,
    params,
    setParams,
  };
}

