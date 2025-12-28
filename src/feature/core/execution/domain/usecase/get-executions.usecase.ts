import { ApiEither } from "@/feature/common/data/api-task";
import { diResolve } from "@/feature/common/features.di";
import WithPagination from "@/feature/common/class-helpers/with-pagination";
import { executionModuleKey } from "@/feature/core/execution/data/execution-module-key";
import ExecutionRepository, {
  executionRepoKey,
  GetExecutionsParams,
  ExecutionWithWorkflow,
} from "@/feature/core/execution/domain/i-repo/execution.repository.interface";

export default async function getExecutionsUseCase(
  params: GetExecutionsParams,
): Promise<ApiEither<WithPagination<ExecutionWithWorkflow>>> {
  const repo = diResolve<ExecutionRepository>(
    executionModuleKey,
    executionRepoKey,
  );
  return repo.getMany(params)();
}
