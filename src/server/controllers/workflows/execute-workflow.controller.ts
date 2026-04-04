"use server";

import { isLeft, left, right } from "fp-ts/lib/Either";
import { connection } from "next/server";
import { sendWorkflowExecution } from "@/bootstrap/integrations/inngest/util";
import type { ApiEither } from "@/feature/common/data/api-task";
import { failureOr } from "@/feature/common/failures/failure-helpers";
import NetworkFailure from "@/feature/common/failures/network.failure";
import type Workflow from "@/feature/core/workflow/domain/entity/workflow.entity";
import executeWorkflowUseCase from "@/feature/core/workflow/domain/usecase/execute-workflow.usecase";

export default async function executeWorkflowController(params: {
  id: string;
  userId: string;
}): Promise<ApiEither<Workflow>> {
  await connection();

  const workflowResult = await executeWorkflowUseCase(params);
  if (isLeft(workflowResult)) {
    return workflowResult;
  }

  try {
    await sendWorkflowExecution({
      workflowId: params.id,
    });
  } catch (error) {
    return left(failureOr(error, new NetworkFailure(error as Error)));
  }

  return right(workflowResult.right);
}
