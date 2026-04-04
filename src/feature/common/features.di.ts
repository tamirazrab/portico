import type { DependencyContainer, InjectionToken } from "tsyringe";
import di from "@/bootstrap/di/init-di";
import { credentialModuleKey } from "@/feature/core/credential/data/credential-module-key";
import credentialModule from "@/feature/core/credential/data/module/credential.module";
import { executionModuleKey } from "@/feature/core/execution/data/execution-module-key";
import executionModule from "@/feature/core/execution/data/module/execution.module";
import userModule from "@/feature/core/user/data/module/user-module";
import { userModuleKey } from "@/feature/core/user/data/user-module-key";
import workflowModule from "@/feature/core/workflow/data/module/workflow.module";
import { workflowModuleKey } from "@/feature/core/workflow/data/workflow-module-key";
import { authModuleKey } from "@/feature/generic/auth/auth-module-key";
import authModule from "@/feature/generic/auth/data/module/auth.module";
import globalModule from "./data/global.module";

/**
 * On adding new domain module, just add it to this list
 */
const moduleKeyToDi: Record<
  string,
  (di: DependencyContainer) => DependencyContainer
> = {
  [authModuleKey]: authModule,
  [userModuleKey]: userModule,
  [workflowModuleKey]: workflowModule,
  [credentialModuleKey]: credentialModule,
  [executionModuleKey]: executionModule,
};

const memoizedDis: Record<string, DependencyContainer> = {};

export default function featuresDi(module: string): DependencyContainer {
  if (memoizedDis[module]) return memoizedDis[module];
  const moduleDiHandler = moduleKeyToDi[module];
  if (!moduleDiHandler)
    throw new Error(`Server Di didn't found for module: ${module}`);

  const moduleDi = moduleDiHandler(di.createChildContainer());
  globalModule(moduleDi);
  memoizedDis[module] = moduleDi;
  return moduleDi;
}

export function diResolve<T = unknown>(module: string, key: InjectionToken): T {
  return featuresDi(module).resolve<T>(key);
}
