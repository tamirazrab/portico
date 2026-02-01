import { Suspense } from "react";
import { LoadingView } from "@/components/entity-components";
import ExecutionsContainerView from "./view/executions-container.view";

function ExecutionsLoading() {
  return <LoadingView message="Loading Executions..." />;
}

export default async function ExecutionsPage() {
  return (
    <Suspense fallback={<ExecutionsLoading />}>
      <ExecutionsContainerView />
    </Suspense>
  );
}
