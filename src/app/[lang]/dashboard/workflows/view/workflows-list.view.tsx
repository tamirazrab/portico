"use client";

import { EntityList, EmptyView } from "@/components/entity-components";
import { useWorkflows } from "../hooks/use-workflows";
import WorkflowItemView from "./workflow-item.view";

export default function WorkflowsListView() {
  const { workflows, isEmpty } = useWorkflows();

  if (isEmpty) {
    return (
      <EmptyView message="No workflows found. Get started by creating one." />
    );
  }

  return (
    <EntityList
      items={workflows}
      getKey={(workflow) => workflow.id}
      renderItem={(workflow) => <WorkflowItemView workflow={workflow} />}
      emptyView={<EmptyView message="No workflows found." />}
    />
  );
}
