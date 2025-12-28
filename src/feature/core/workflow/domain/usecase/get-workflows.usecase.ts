import { ApiEither } from "@/feature/common/data/api-task";
import { diResolve } from "@/feature/common/features.di";
import WithPagination from "@/feature/common/class-helpers/with-pagination";
import { workflowModuleKey } from "@/feature/core/workflow/data/workflow-module-key";
import WorkflowRepository, {
  workflowRepoKey,
  GetWorkflowsParams,
} from "@/feature/core/workflow/domain/i-repo/workflow.repository.interface";
import Workflow from "../entity/workflow.entity";

export default async function getWorkflowsUseCase(
  params: GetWorkflowsParams,
): Promise<ApiEither<WithPagination<Workflow>>> {
  const repo = diResolve<WorkflowRepository>(
    workflowModuleKey,
    workflowRepoKey,
  );

  return repo.getMany(params)();
}
