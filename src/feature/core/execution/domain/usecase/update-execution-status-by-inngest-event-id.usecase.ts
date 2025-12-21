import { ApiEither } from "@/feature/common/data/api-task";
import { diResolve } from "@/feature/common/features.di";
import { executionModuleKey } from "@/feature/core/execution/data/execution-module-key";
import ExecutionRepository, {
  executionRepoKey,
} from "@/feature/core/execution/domain/i-repo/execution.repository.interface";
import ExecutionStatus from "../enum/execution-status.enum";

export default async function updateExecutionStatusByInngestEventIdUseCase(params: {
  inngestEventId: string;
  status: ExecutionStatus;
  error?: string;
  errorStack?: string;
  output?: Record<string, unknown>;
}): Promise<ApiEither<import("../entity/execution.entity").default>> {
  const repo = diResolve<ExecutionRepository>(executionModuleKey, executionRepoKey);
  return repo.updateStatusByInngestEventId(params)();
}

