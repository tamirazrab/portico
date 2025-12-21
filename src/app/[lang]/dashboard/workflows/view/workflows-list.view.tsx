"use client";

import WorkflowsListIVM from "./workflows-list.i-vm";
import WorkflowsListVM from "../vm/workflows-list.vm";
import { EntityList, EmptyView } from "@/components/entity-components";
import WorkflowItemView from "./workflow-item.view";

export default function WorkflowsListView() {
  const vm = new WorkflowsListVM();
  const vmData = vm.useVM();

  if (vmData.isEmpty) {
    return <EmptyView message="No workflows found. Get started by creating one." />;
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
