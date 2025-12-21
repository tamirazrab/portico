import ExecutionRepositoryImpl from "@/feature/core/execution/data/repository/execution.repository";
import { executionRepoKey } from "@/feature/core/execution/domain/i-repo/execution.repository.interface";
import { DependencyContainer } from "tsyringe";

export default function executionModule(di: DependencyContainer) {
  di.register(executionRepoKey, ExecutionRepositoryImpl);
  return di;
}

