"use client";

import { EntityContainer } from "@/components/entity-components";
import CredentialsHeaderView from "./credentials-header.view";
import CredentialsListView from "./credentials-list.view";
import CredentialsPaginationView from "./credentials-pagination.view";
import CredentialsSearchView from "./credentials-search.view";

export default function CredentialsContainerView() {
  return (
    <EntityContainer
      header={<CredentialsHeaderView />}
      search={<CredentialsSearchView />}
      pagination={<CredentialsPaginationView />}
    >
      <CredentialsListView />
    </EntityContainer>
  );
}
