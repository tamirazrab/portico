import { Suspense } from "react";
import { LoadingView } from "@/components/entity-components";
import CredentialsContainerView from "./view/credentials-container.view";

function CredentialsLoading() {
  return <LoadingView message="Loading Credentials..." />;
}

export default async function CredentialsPage() {
  return (
    <Suspense fallback={<CredentialsLoading />}>
      <CredentialsContainerView />
    </Suspense>
  );
}
