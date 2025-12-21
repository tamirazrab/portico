import { ApiEither } from "@/feature/common/data/api-task";
import { diResolve } from "@/feature/common/features.di";
import { workflowModuleKey } from "@/feature/core/workflow/data/workflow-module-key";
import WorkflowRepository, {
  workflowRepoKey,
  UpdateWorkflowParams,
} from "@/feature/core/workflow/domain/i-repo/workflow.repository.interface";

export default async function updateWorkflowUseCase(
  params: UpdateWorkflowParams,
): Promise<ApiEither<import("../entity/workflow.entity").default>> {
  const repo = diResolve<WorkflowRepository>(workflowModuleKey, workflowRepoKey);

  return repo.update(params)();
}

