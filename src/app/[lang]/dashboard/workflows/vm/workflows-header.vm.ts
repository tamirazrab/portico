"use client";

import { BaseVM } from "reactvvm";
import WorkflowsHeaderIVM from "../view/workflows-header.i-vm";
import CreateWorkflowButtonVM from "./create-workflow-button.vm";

export default class WorkflowsHeaderVM extends BaseVM<WorkflowsHeaderIVM> {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- useVM is a hook method
  useVM(): WorkflowsHeaderIVM {
    const createButtonVM = new CreateWorkflowButtonVM();
    const createButtonData = createButtonVM.useVM();

    return {
      title: "Workflows",
      description: "Create and Manage your Workflows",
      createButtonLabel: createButtonData.props.title,
      isCreating: createButtonData.props.isDisable,
      onCreate: createButtonData.onClick,
      disabled: false,
    };
  }
}
