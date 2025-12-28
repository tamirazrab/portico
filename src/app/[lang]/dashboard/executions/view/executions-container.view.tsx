"use client";

import { EntityContainer } from "@/components/entity-components";
import ExecutionsHeaderView from "./executions-header.view";
import ExecutionsListView from "./executions-list.view";
import ExecutionsPaginationView from "./executions-pagination.view";

export default function ExecutionsContainerView() {
  return (
    <EntityContainer
      header={<ExecutionsHeaderView />}
      pagination={<ExecutionsPaginationView />}
    >
      <ExecutionsListView />
    </EntityContainer>
  );
}
