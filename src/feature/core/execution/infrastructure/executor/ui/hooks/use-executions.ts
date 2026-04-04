"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTRPC } from "@/trpc/client";
import { useExecutionsParams } from "./use-executions-params";

export function useSuspenseExecution(id: string) {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.executions.getOne.queryOptions({ id }));
}

export function useSuspenseExecutions() {
  const trpc = useTRPC();
  const [params] = useExecutionsParams();
  const input = useMemo(
    () => ({ page: params.page, pageSize: params.pageSize }),
    [params.page, params.pageSize],
  );
  return useSuspenseQuery(trpc.executions.getMany.queryOptions(input));
}
