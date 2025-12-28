export type WorkflowConnectionParams = Omit<
  WorkflowConnection,
  "toPlainObject"
>;

export default class WorkflowConnection {
  readonly id: string;

  readonly workflowId: string;

  readonly fromNodeId: string;

  readonly toNodeId: string;

  readonly fromOutput: string;

  readonly toInput: string;

  readonly createdAt: Date;

  readonly updatedAt: Date;

  constructor(params: WorkflowConnectionParams) {
    this.id = params.id;
    this.workflowId = params.workflowId;
    this.fromNodeId = params.fromNodeId;
    this.toNodeId = params.toNodeId;
    this.fromOutput = params.fromOutput;
    this.toInput = params.toInput;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  toPlainObject(): WorkflowConnectionParams {
    return {
      id: this.id,
      workflowId: this.workflowId,
      fromNodeId: this.fromNodeId,
      toNodeId: this.toNodeId,
      fromOutput: this.fromOutput,
      toInput: this.toInput,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
