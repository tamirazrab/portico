import type { DependencyContainer } from "tsyringe";
import WorkflowRepositoryImpl from "@/feature/core/workflow/data/repository/workflow.repository";
import { workflowRepoKey } from "@/feature/core/workflow/domain/i-repo/workflow.repository.interface";

export default function workflowModule(di: DependencyContainer) {
  di.register(workflowRepoKey, WorkflowRepositoryImpl);
  return di;
}
