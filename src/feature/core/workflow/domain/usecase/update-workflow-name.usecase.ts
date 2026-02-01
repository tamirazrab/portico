import { ApiEither } from "@/feature/common/data/api-task";
import { diResolve } from "@/feature/common/features.di";
import { workflowModuleKey } from "@/feature/core/workflow/data/workflow-module-key";
import WorkflowRepository, {
  workflowRepoKey,
} from "@/feature/core/workflow/domain/i-repo/workflow.repository.interface";

export default async function updateWorkflowNameUseCase(params: {
  id: string;
  userId: string;
  name: string;
}): Promise<ApiEither<import("../entity/workflow.entity").default>> {
  const repo = diResolve<WorkflowRepository>(
    workflowModuleKey,
    workflowRepoKey,
  );

  return repo.updateName(params);
}
