import { Suspense } from "react";
import { LoadingView } from "@/components/entity-components";
import WorkflowsContainerView from "./view/workflows-container.view";

function WorkflowsLoading() {
  return <LoadingView message="Loading Workflows..." />;
}

export default async function WorkflowsPage() {
  return (
    <Suspense fallback={<WorkflowsLoading />}>
      <WorkflowsContainerView />
    </Suspense>
  );
}
