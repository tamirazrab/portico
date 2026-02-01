"use client";

import { EntityHeader } from "@/components/entity-components";
import CreateWorkflowButtonVM from "../vm/create-workflow-button.vm";

export default function WorkflowsHeaderView() {
  const createButtonVM = new CreateWorkflowButtonVM();
  const createButtonData = createButtonVM.useVM();

  return (
    <EntityHeader
      title="Workflows"
      description="Create and Manage your Workflows"
      onNew={createButtonData.onClick}
      newButtonLabel={createButtonData.props.title}
      isCreating={createButtonData.props.isDisable}
    />
  );
}
