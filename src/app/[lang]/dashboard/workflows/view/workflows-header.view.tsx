"use client";

import WorkflowsHeaderIVM from "./workflows-header.i-vm";
import WorkflowsHeaderVM from "../vm/workflows-header.vm";
import { EntityHeader } from "@/components/entity-components";

export default function WorkflowsHeaderView() {
  const vm = new WorkflowsHeaderVM();
  const vmData = vm.useVM();

  return (
    <EntityHeader
      title={vmData.title}
      description={vmData.description}
      onNew={vmData.onCreate}
      newButtonLabel={vmData.createButtonLabel}
      disabled={vmData.disabled}
      isCreating={vmData.isCreating}
    />
  );
}

