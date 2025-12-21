import ApiTask from "@/feature/common/data/api-task";
import WithPagination from "@/feature/common/class-helpers/with-pagination";
import Execution from "../entity/execution.entity";
import ExecutionStatus from "../enum/execution-status.enum";

export type CreateExecutionParams = {
  workflowId: string;
  inngestEventId: string;
};

export type UpdateExecutionStatusParams = {
  id: string;
  status: ExecutionStatus;
  error?: string;
  errorStack?: string;
  output?: Record<string, unknown>;
};

export type GetExecutionsParams = {
  userId: string;
  page?: number;
  pageSize?: number;
};

export type GetExecutionParams = {
  id: string;
  userId: string;
};

export type GetExecutionByInngestEventIdParams = {
  inngestEventId: string;
};

export type ExecutionWithWorkflow = Execution & {
  workflow: {
    id: string;
    name: string;
  };
};

export default interface ExecutionRepository {
  create(params: CreateExecutionParams): ApiTask<Execution>;
  updateStatus(params: UpdateExecutionStatusParams): ApiTask<Execution>;
  updateStatusByInngestEventId(params: {
    inngestEventId: string;
  } & Omit<UpdateExecutionStatusParams, "id">): ApiTask<Execution>;
  getOne(params: GetExecutionParams): ApiTask<ExecutionWithWorkflow>;
  getOneByInngestEventId(params: GetExecutionByInngestEventIdParams): ApiTask<Execution>;
  getMany(params: GetExecutionsParams): ApiTask<WithPagination<ExecutionWithWorkflow>>;
}

export const executionRepoKey = "executionRepoKey";

