"use client";

import { EntityList, EmptyView } from "@/components/entity-components";
import ExecutionsListIVM from "./executions-list.i-vm";
import ExecutionsListVM from "../vm/executions-list.vm";
import ExecutionItemView from "./execution-item.view";

export default function ExecutionsListView() {
  const vm = new ExecutionsListVM();
  const vmData = vm.useVM();

  if (vmData.isEmpty) {
    return (
      <EmptyView message="No Executions found." />
    );
  }

  return (
    <EntityList
      items={vmData.executions}
      getKey={(execution) => execution.id}
      renderItem={(execution) => <ExecutionItemView execution={execution} />}
      emptyView={<EmptyView message="No Executions found." />}
    />
  );
}

