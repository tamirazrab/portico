"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { LoadingView, ErrorView } from "@/components/entity-components";
import CredentialFormView from "./credential-form.view";

interface CredentialDetailViewProps {
  credentialId: string;
}

function CredentialLoading() {
  return <LoadingView message="Loading Credential..." />;
}

function CredentialError() {
  return <ErrorView message="Error loading Credential..." />;
}

function CredentialDetailContent({ credentialId }: CredentialDetailViewProps) {
  const trpc = useTRPC();
  const { data: credential } = useSuspenseQuery(
    trpc.credentials.getOne.queryOptions({ id: credentialId }),
  );

  return <CredentialFormView initialData={credential} />;
}

export default function CredentialDetailView({
  credentialId,
}: CredentialDetailViewProps) {
  return (
    <ErrorBoundary fallback={<CredentialError />}>
      <Suspense fallback={<CredentialLoading />}>
        <CredentialDetailContent credentialId={credentialId} />
      </Suspense>
    </ErrorBoundary>
  );
}
