import type { ApiEither } from "@/feature/common/data/api-task";
import { diResolve } from "@/feature/common/features.di";
import { workflowModuleKey } from "@/feature/core/workflow/data/workflow-module-key";
import type WorkflowRepository from "@/feature/core/workflow/domain/i-repo/workflow.repository.interface";
import {
  type GetWorkflowParams,
  type WorkflowWithNodesAndConnections,
  workflowRepoKey,
} from "@/feature/core/workflow/domain/i-repo/workflow.repository.interface";

export default async function getWorkflowUseCase(
  params: GetWorkflowParams,
): Promise<ApiEither<WorkflowWithNodesAndConnections>> {
  const repo = diResolve<WorkflowRepository>(
    workflowModuleKey,
    workflowRepoKey,
  );

  return repo.getOne(params);
}
