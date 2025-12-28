"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { LoadingView, ErrorView } from "@/components/entity-components";
import EditorView from "./editor.view";
import EditorHeaderView from "./editor-header.view";

interface EditorWrapperViewProps {
  workflowId: string;
}

function EditorLoading() {
  return <LoadingView message="Loading editor..." />;
}

function EditorError() {
  return <ErrorView message="Error loading editor..." />;
}

function EditorContent({ workflowId }: EditorWrapperViewProps) {
  const trpc = useTRPC();
  const { data: workflow } = useSuspenseQuery(
    trpc.workflows.getOne.queryOptions({ id: workflowId }),
  );

  return (
    <>
      <EditorHeaderView workflowId={workflowId} workflowName={workflow.name} />
      <main className="flex-1">
        <EditorView
          workflowId={workflowId}
          initialNodes={workflow.nodes}
          initialEdges={workflow.edges}
        />
      </main>
    </>
  );
}

export default function EditorWrapperView({
  workflowId,
}: EditorWrapperViewProps) {
  return (
    <ErrorBoundary fallback={<EditorError />}>
      <Suspense fallback={<EditorLoading />}>
        <EditorContent workflowId={workflowId} />
      </Suspense>
    </ErrorBoundary>
  );
}
