import type WithPagination from "@/feature/common/class-helpers/with-pagination";
import type { ApiEither } from "@/feature/common/data/api-task";
import { diResolve } from "@/feature/common/features.di";
import { workflowModuleKey } from "@/feature/core/workflow/data/workflow-module-key";
import type WorkflowRepository from "@/feature/core/workflow/domain/i-repo/workflow.repository.interface";
import {
  type GetWorkflowsParams,
  workflowRepoKey,
} from "@/feature/core/workflow/domain/i-repo/workflow.repository.interface";
import type Workflow from "../entity/workflow.entity";

export default async function getWorkflowsUseCase(
  params: GetWorkflowsParams,
): Promise<ApiEither<WithPagination<Workflow>>> {
  const repo = diResolve<WorkflowRepository>(
    workflowModuleKey,
    workflowRepoKey,
  );

  return repo.getMany(params);
}
