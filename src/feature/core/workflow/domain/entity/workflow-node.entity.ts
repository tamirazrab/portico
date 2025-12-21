import NodeType from "../enum/node-type.enum";

export type WorkflowNodeParams = Omit<WorkflowNode, "toPlainObject">;

export default class WorkflowNode {
  readonly id: string;
  readonly workflowId: string;
  readonly name: string;
  readonly type: NodeType;
  readonly position: { x: number; y: number };
  readonly data: Record<string, unknown>;
  readonly credentialId?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(params: WorkflowNodeParams) {
    this.id = params.id;
    this.workflowId = params.workflowId;
    this.name = params.name;
    this.type = params.type;
    this.position = params.position;
    this.data = params.data;
    this.credentialId = params.credentialId;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  toPlainObject(): WorkflowNodeParams {
    return {
      id: this.id,
      workflowId: this.workflowId,
      name: this.name,
      type: this.type,
      position: this.position,
      data: this.data,
      credentialId: this.credentialId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

