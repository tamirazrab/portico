import { ApiEither } from "@/feature/common/data/api-task";
import { diResolve } from "@/feature/common/features.di";
import { executionModuleKey } from "@/feature/core/execution/data/execution-module-key";
import ExecutionRepository, {
  executionRepoKey,
  CreateExecutionParams,
} from "@/feature/core/execution/domain/i-repo/execution.repository.interface";

export default async function createExecutionUseCase(
  params: CreateExecutionParams,
): Promise<ApiEither<import("../entity/execution.entity").default>> {
  const repo = diResolve<ExecutionRepository>(
    executionModuleKey,
    executionRepoKey,
  );
  return repo.create(params);
}
