"use client";

import { EntityContainer } from "@/components/entity-components";
import WorkflowsHeaderView from "./workflows-header.view";
import WorkflowsListView from "./workflows-list.view";
import WorkflowsPaginationView from "./workflows-pagination.view";
import WorkflowsSearchView from "./workflows-search.view";

export default function WorkflowsContainerView() {
  return (
    <EntityContainer
      header={<WorkflowsHeaderView />}
      search={<WorkflowsSearchView />}
      pagination={<WorkflowsPaginationView />}
    >
      <WorkflowsListView />
    </EntityContainer>
  );
}
