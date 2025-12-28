import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { LoadingView, ErrorView } from "@/components/entity-components";
import CredentialsContainerView from "./view/credentials-container.view";

function CredentialsError() {
  return <ErrorView message="Error loading credentials..." />;
}

function CredentialsLoading() {
  return <LoadingView message="Loading Credentials..." />;
}

export default async function CredentialsPage() {
  return (
    <ErrorBoundary fallback={<CredentialsError />}>
      <Suspense fallback={<CredentialsLoading />}>
        <CredentialsContainerView />
      </Suspense>
    </ErrorBoundary>
  );
}
