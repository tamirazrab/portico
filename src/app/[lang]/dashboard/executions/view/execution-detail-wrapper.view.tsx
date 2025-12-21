"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import ExecutionDetailView from "./execution-detail.view";
import { LoadingView, ErrorView } from "@/components/entity-components";

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

  return <ExecutionDetailView execution={execution} />;
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

