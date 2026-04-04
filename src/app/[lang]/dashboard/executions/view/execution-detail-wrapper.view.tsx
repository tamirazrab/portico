"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorView, LoadingView } from "@/components/entity-components";
import { useTRPC } from "@/trpc/client";
import type { Execution } from "../types";
import ExecutionDetailView from "./execution-detail.view";

interface ExecutionDetailWrapperViewProps {
  executionId: string;
}

function ExecutionLoading() {
  return <LoadingView message="Loading Execution..." />;
}

function ExecutionError() {
  return <ErrorView message="Error loading Execution..." />;
}

function ExecutionDetailContent({
  executionId,
}: ExecutionDetailWrapperViewProps) {
  const trpc = useTRPC();
  const { data: execution } = useSuspenseQuery(
    trpc.executions.getOne.queryOptions({ id: executionId }),
  );

  return <ExecutionDetailView execution={execution as unknown as Execution} />;
}

export default function ExecutionDetailWrapperView({
  executionId,
}: ExecutionDetailWrapperViewProps) {
  return (
    <ErrorBoundary fallback={<ExecutionError />}>
      <Suspense fallback={<ExecutionLoading />}>
        <ExecutionDetailContent executionId={executionId} />
      </Suspense>
    </ErrorBoundary>
  );
}
