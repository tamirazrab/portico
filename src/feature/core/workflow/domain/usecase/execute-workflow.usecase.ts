import { isLeft, left, right } from "fp-ts/lib/Either";
import { userHasActivePolarSubscription } from "@/bootstrap/helpers/billing/polar-customer-state";
import type { ApiEither } from "@/feature/common/data/api-task";
import { diResolve } from "@/feature/common/features.di";
import { workflowModuleKey } from "@/feature/core/workflow/data/workflow-module-key";
import NodeType from "@/feature/core/workflow/domain/enum/node-type.enum";
import PremiumRequiredFailure from "@/feature/core/workflow/domain/failure/premium-required-failure";
import type WorkflowRepository from "@/feature/core/workflow/domain/i-repo/workflow.repository.interface";
import { workflowRepoKey } from "@/feature/core/workflow/domain/i-repo/workflow.repository.interface";
import type Workflow from "../entity/workflow.entity";

const PREMIUM_NODE_TYPES: ReadonlySet<NodeType> = new Set([
  NodeType.OPENAI,
  NodeType.ANTHROPIC,
  NodeType.GEMINI,
  NodeType.DISCORD,
  NodeType.SLACK,
]);

export default async function executeWorkflowUseCase(params: {
  id: string;
  userId: string;
}): Promise<ApiEither<Workflow>> {
  const repo = diResolve<WorkflowRepository>(
    workflowModuleKey,
    workflowRepoKey,
  );

  const workflowResult = await repo.getOne({
    id: params.id,
    userId: params.userId,
  });

  if (isLeft(workflowResult)) {
    return workflowResult;
  }

  const { workflow, nodes } = workflowResult.right;
  const needsPremium = nodes.some((n) => PREMIUM_NODE_TYPES.has(n.type));
  if (needsPremium) {
    const entitled = await userHasActivePolarSubscription(params.userId);
    if (!entitled) {
      return left(new PremiumRequiredFailure());
    }
  }

  // The actual execution is handled by Inngest; this use case only validates access.
  return right(workflow);
}
