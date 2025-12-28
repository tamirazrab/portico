"use client";

import { BaseVM } from "reactvvm";
import ExecutionItemIVM from "../view/execution-item.i-vm";

// Using Prisma types for UI layer
type Execution = {
  id: string;
  workflowId: string;
  status: string;
  error: string | null;
  startedAt: Date;
  completedAt: Date | null;
  workflow: {
    id: string;
    name: string;
  };
};

export default class ExecutionItemVM extends BaseVM<ExecutionItemIVM> {
  private execution: Execution;

  constructor(execution: Execution) {
    super();
    this.execution = execution;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks -- useVM is a hook method
  useVM(): ExecutionItemIVM {
    return {
      execution: this.execution,
    };
  }
}
