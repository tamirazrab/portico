import { PrismaClient } from "@/generated/prisma/client";
import WithPagination from "@/feature/common/class-helpers/with-pagination";
import Workflow from "@/feature/core/workflow/domain/entity/workflow.entity";
import WorkflowNode from "@/feature/core/workflow/domain/entity/workflow-node.entity";
import WorkflowConnection from "@/feature/core/workflow/domain/entity/workflow-connection.entity";
import NodeType from "@/feature/core/workflow/domain/enum/node-type.enum";

type WorkflowDbResponse = {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

type WorkflowNodeDbResponse = {
  id: string;
  workflowId: string;
  name: string;
  type: string;
  position: unknown;
  data: unknown;
  credentialId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type WorkflowConnectionDbResponse = {
  id: string;
  workflowId: string;
  fromNodeId: string;
  toNodeId: string;
  fromOutput: string;
  toInput: string;
  createdAt: Date;
  updatedAt: Date;
};

export default class WorkflowMapper {
  static toEntity(dbWorkflow: WorkflowDbResponse): Workflow {
    return new Workflow({
      id: dbWorkflow.id,
      name: dbWorkflow.name,
      userId: dbWorkflow.userId,
      createdAt: dbWorkflow.createdAt,
      updatedAt: dbWorkflow.updatedAt,
    });
  }

  static nodeToEntity(dbNode: WorkflowNodeDbResponse): WorkflowNode {
    return new WorkflowNode({
      id: dbNode.id,
      workflowId: dbNode.workflowId,
      name: dbNode.name,
      type: dbNode.type as NodeType,
      position: dbNode.position as { x: number; y: number },
      data: (dbNode.data as Record<string, unknown>) || {},
      credentialId: dbNode.credentialId || undefined,
      createdAt: dbNode.createdAt,
      updatedAt: dbNode.updatedAt,
    });
  }

  static connectionToEntity(
    dbConnection: WorkflowConnectionDbResponse,
  ): WorkflowConnection {
    return new WorkflowConnection({
      id: dbConnection.id,
      workflowId: dbConnection.workflowId,
      fromNodeId: dbConnection.fromNodeId,
      toNodeId: dbConnection.toNodeId,
      fromOutput: dbConnection.fromOutput,
      toInput: dbConnection.toInput,
      createdAt: dbConnection.createdAt,
      updatedAt: dbConnection.updatedAt,
    });
  }

  static toPaginatedEntity(
    dbWorkflows: WorkflowDbResponse[],
    total: number,
  ): WithPagination<Workflow> {
    const workflows = dbWorkflows.map((wf) => WorkflowMapper.toEntity(wf));
    return new WithPagination(workflows, total);
  }
}

