import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { LoadingView, ErrorView } from "@/components/entity-components";
import WorkflowsContainerView from "@/app/[lang]/dashboard/workflows/view/workflows-container.view";

function WorkflowsError() {
  return <ErrorView message="Error loading workflows..." />;
}

function WorkflowsLoading() {
  return <LoadingView message="Loading Workflows..." />;
}

export default async function WorkflowsPage() {
  return (
    <ErrorBoundary fallback={<WorkflowsError />}>
      <Suspense fallback={<WorkflowsLoading />}>
        <WorkflowsContainerView />
      </Suspense>
    </ErrorBoundary>
  );
}

