import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { LoadingView, ErrorView } from "@/components/entity-components";
import ExecutionsContainerView from "@/app/[lang]/dashboard/executions/view/executions-container.view";

function ExecutionsError() {
  return <ErrorView message="Error loading executions..." />;
}

function ExecutionsLoading() {
  return <LoadingView message="Loading Executions..." />;
}

export default async function ExecutionsPage() {
  return (
    <ErrorBoundary fallback={<ExecutionsError />}>
      <Suspense fallback={<ExecutionsLoading />}>
        <ExecutionsContainerView />
      </Suspense>
    </ErrorBoundary>
  );
}

