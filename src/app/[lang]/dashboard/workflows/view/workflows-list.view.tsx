"use client";

import { EntityList, EmptyView } from "@/components/entity-components";
import WorkflowsListVM from "../vm/workflows-list.vm";
import WorkflowsListIVM from "./workflows-list.i-vm";
import WorkflowItemView from "./workflow-item.view";

export default function WorkflowsListView() {
  const vm = new WorkflowsListVM();
  const vmData = vm.useVM();

  if (vmData.isEmpty) {
    return (
      <EmptyView message="No workflows found. Get started by creating one." />
    );
  }

  return (
    <EntityList
      items={vmData.workflows}
      getKey={(workflow) => workflow.id}
      renderItem={(workflow) => <WorkflowItemView workflow={workflow} />}
      emptyView={<EmptyView message="No workflows found." />}
    />
  );
}
