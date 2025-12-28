"use client";

import { BaseVM } from "reactvvm";
import ExecutionsHeaderIVM from "../view/executions-header.i-vm";

export default class ExecutionsHeaderVM extends BaseVM<ExecutionsHeaderIVM> {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- useVM is a hook method
  useVM(): ExecutionsHeaderIVM {
    return {
      title: "Executions",
      description: "View your workflow execution history",
    };
  }
}
