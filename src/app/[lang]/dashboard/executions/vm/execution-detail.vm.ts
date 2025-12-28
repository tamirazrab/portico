"use client";

import { BaseVM } from "reactvvm";
import { useState } from "react";
import ExecutionDetailIVM from "../view/execution-detail.i-vm";

// Using Prisma types for UI layer
type Execution = {
  id: string;
  workflowId: string;
  status: string;
  error: string | null;
  errorStack: string | null;
  startedAt: Date;
  completedAt: Date | null;
  inngestEventId: string;
  output: unknown;
  workflow: {
    id: string;
    name: string;
  };
};

interface ExecutionDetailVMProps {
  execution: Execution;
}

export default class ExecutionDetailVM extends BaseVM<ExecutionDetailIVM> {
  private execution: Execution;

  constructor(execution: Execution) {
    super();
    this.execution = execution;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks -- useVM is a hook method
  useVM(): ExecutionDetailIVM {
    const [showStackTrace, setShowStackTrace] = useState(false);

    const duration = this.execution.completedAt
      ? Math.round(
          (this.execution.completedAt.getTime() -
            this.execution.startedAt.getTime()) /
            1000,
        )
      : null;

    return {
      execution: this.execution,
      duration,
      showStackTrace,
      onToggleStackTrace: () => {
        setShowStackTrace((prev) => !prev);
      },
    };
  }
}
