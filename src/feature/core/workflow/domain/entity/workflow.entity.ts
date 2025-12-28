export type WorkflowParams = Omit<Workflow, "toPlainObject">;

export default class Workflow {
  readonly id: string;

  readonly name: string;

  readonly userId: string;

  readonly createdAt: Date;

  readonly updatedAt: Date;

  constructor(params: WorkflowParams) {
    this.id = params.id;
    this.name = params.name;
    this.userId = params.userId;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  toPlainObject(): WorkflowParams {
    return {
      id: this.id,
      name: this.name,
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
