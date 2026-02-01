import { ApiEither } from "@/feature/common/data/api-task";
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
  create(params: CreateWorkflowParams): Promise<ApiEither<Workflow>>;
  update(params: UpdateWorkflowParams): Promise<ApiEither<Workflow>>;
  updateName(params: {
    id: string;
    userId: string;
    name: string;
  }): Promise<ApiEither<Workflow>>;
  delete(params: { id: string; userId: string }): Promise<ApiEither<true>>;
  getOne(params: GetWorkflowParams): Promise<ApiEither<WorkflowWithNodesAndConnections>>;
  getMany(params: GetWorkflowsParams): Promise<ApiEither<WithPagination<Workflow>>>;
  /**
   * Get workflow by ID only (for internal execution use in infrastructure layer).
   * This bypasses userId check and should only be used in trusted infrastructure contexts.
   */
  getByIdForExecution(id: string): Promise<ApiEither<WorkflowWithNodesAndConnections>>;
}

export const workflowRepoKey = "workflowRepoKey";
