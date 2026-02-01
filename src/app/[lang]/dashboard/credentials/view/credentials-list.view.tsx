"use client";

import { EntityList, EmptyView } from "@/components/entity-components";
import { useCredentials } from "../hooks/use-credentials-list";
import CredentialItemView from "./credential-item.view";

export default function CredentialsListView() {
  const { credentials, isEmpty } = useCredentials();

  if (isEmpty) {
    return (
      <EmptyView message="No Credentials found. Get started by creating one." />
    );
  }

  return (
    <EntityList
      items={credentials}
      getKey={(credential) => credential.id}
      renderItem={(credential) => (
        <CredentialItemView credential={credential} />
      )}
      emptyView={<EmptyView message="No Credentials found." />}
    />
  );
}
