import { ApiEither } from "@/feature/common/data/api-task";
import { diResolve } from "@/feature/common/features.di";
import { executionModuleKey } from "@/feature/core/execution/data/execution-module-key";
import ExecutionRepository, {
  executionRepoKey,
  GetExecutionParams,
  ExecutionWithWorkflow,
} from "@/feature/core/execution/domain/i-repo/execution.repository.interface";

export default async function getExecutionUseCase(
  params: GetExecutionParams,
): Promise<ApiEither<ExecutionWithWorkflow>> {
  const repo = diResolve<ExecutionRepository>(
    executionModuleKey,
    executionRepoKey,
  );
  return repo.getOne(params);
}
