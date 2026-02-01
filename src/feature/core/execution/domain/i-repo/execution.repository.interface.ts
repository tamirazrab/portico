import { ApiEither } from "@/feature/common/data/api-task";
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
  create(params: CreateExecutionParams): Promise<ApiEither<Execution>>;
  updateStatus(params: UpdateExecutionStatusParams): Promise<ApiEither<Execution>>;
  updateStatusByInngestEventId(
    params: {
      inngestEventId: string;
    } & Omit<UpdateExecutionStatusParams, "id">,
  ): Promise<ApiEither<Execution>>;
  getOne(params: GetExecutionParams): Promise<ApiEither<ExecutionWithWorkflow>>;
  getOneByInngestEventId(
    params: GetExecutionByInngestEventIdParams,
  ): Promise<ApiEither<Execution>>;
  getMany(
    params: GetExecutionsParams,
  ): Promise<ApiEither<WithPagination<ExecutionWithWorkflow>>>;
}

export const executionRepoKey = "executionRepoKey";
