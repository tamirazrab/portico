import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import WorkflowsContainerView from "./view/workflows-container.view";
import { LoadingView, ErrorView } from "@/components/entity-components";

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
