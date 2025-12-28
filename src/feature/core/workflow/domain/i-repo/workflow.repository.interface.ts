import ApiTask from "@/feature/common/data/api-task";
import WithPagination from "@/feature/common/class-helpers/with-pagination";
import Workflow from "../entity/workflow.entity";
import WorkflowNode from "../entity/workflow-node.entity";
import WorkflowConnection from "../entity/workflow-connection.entity";

export type CreateWorkflowParams = {
  name: string;
  userId: string;
};

export type UpdateWorkflowParams = {
  id: string;
  userId: string;
  name?: string;
  nodes?: Array<{
    id: string;
    type?: string | null;
    position: { x: number; y: number };
    data?: Record<string, unknown>;
  }>;
  edges?: Array<{
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
  }>;
};

export type GetWorkflowsParams = {
  userId: string;
  page?: number;
  pageSize?: number;
  search?: string;
};

export type GetWorkflowParams = {
  id: string;
  userId: string;
};

export type WorkflowWithNodesAndConnections = {
  workflow: Workflow;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
};

export default interface WorkflowRepository {
  create(params: CreateWorkflowParams): ApiTask<Workflow>;
  update(params: UpdateWorkflowParams): ApiTask<Workflow>;
  updateName(params: {
    id: string;
    userId: string;
    name: string;
  }): ApiTask<Workflow>;
  delete(params: { id: string; userId: string }): ApiTask<true>;
  getOne(params: GetWorkflowParams): ApiTask<WorkflowWithNodesAndConnections>;
  getMany(params: GetWorkflowsParams): ApiTask<WithPagination<Workflow>>;
}

export const workflowRepoKey = "workflowRepoKey";
