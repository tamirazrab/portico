import { ApiEither } from "@/feature/common/data/api-task";
import { diResolve } from "@/feature/common/features.di";
import { workflowModuleKey } from "@/feature/core/workflow/data/workflow-module-key";
import WorkflowRepository, {
  workflowRepoKey,
} from "@/feature/core/workflow/domain/i-repo/workflow.repository.interface";

export default async function executeWorkflowUseCase(params: {
  id: string;
  userId: string;
}): Promise<ApiEither<import("../entity/workflow.entity").default>> {
  // First verify the workflow exists and belongs to the user
  const repo = diResolve<WorkflowRepository>(
    workflowModuleKey,
    workflowRepoKey,
  );

  const workflowResult = await repo.getOne({
    id: params.id,
    userId: params.userId,
  })();

  // The actual execution is handled by Inngest, this usecase just validates
  // and triggers the execution. The Inngest integration will handle the rest.
  return workflowResult;
}
