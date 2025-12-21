"use client";

import { EntityList, EmptyView } from "@/components/entity-components";
import CredentialsListIVM from "./credentials-list.i-vm";
import CredentialsListVM from "../vm/credentials-list.vm";
import CredentialItemView from "./credential-item.view";

export default function CredentialsListView() {
  const vm = new CredentialsListVM();
  const vmData = vm.useVM();

  if (vmData.isEmpty) {
    return (
      <EmptyView message="No Credentials found. Get started by creating one." />
    );
  }

  return (
    <EntityList
      items={vmData.credentials}
      getKey={(credential) => credential.id}
      renderItem={(credential) => <CredentialItemView credential={credential} />}
      emptyView={<EmptyView message="No Credentials found." />}
    />
  );
}

