import ExecutionStatus from "../enum/execution-status.enum";

export type ExecutionParams = Omit<Execution, "toPlainObject">;

export default class Execution {
  readonly id: string;

  readonly workflowId: string;

  readonly status: ExecutionStatus;

  readonly error?: string;

  readonly errorStack?: string;

  readonly startedAt: Date;

  readonly completedAt?: Date;

  readonly inngestEventId: string;

  readonly output?: Record<string, unknown>;

  constructor(params: ExecutionParams) {
    this.id = params.id;
    this.workflowId = params.workflowId;
    this.status = params.status;
    this.error = params.error;
    this.errorStack = params.errorStack;
    this.startedAt = params.startedAt;
    this.completedAt = params.completedAt;
    this.inngestEventId = params.inngestEventId;
    this.output = params.output;
  }

  toPlainObject(): ExecutionParams {
    return {
      id: this.id,
      workflowId: this.workflowId,
      status: this.status,
      error: this.error,
      errorStack: this.errorStack,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      inngestEventId: this.inngestEventId,
      output: this.output,
    };
  }
}
