"use server";

import { ApiEither } from "@/feature/common/data/api-task";
import { connection } from "next/server";
import executeWorkflowUseCase from "@/feature/core/workflow/domain/usecase/execute-workflow.usecase";
import { sendWorkflowExecution } from "@/bootstrap/integrations/inngest/util";
import Workflow from "@/feature/core/workflow/domain/entity/workflow.entity";
import { pipe } from "fp-ts/lib/function";
import { chain, map, tryCatch, right } from "fp-ts/lib/TaskEither";

export default async function executeWorkflowController(params: {
  id: string;
  userId: string;
}): Promise<ApiEither<Workflow>> {
  await connection();

  // First verify workflow exists
  const workflowResult = await executeWorkflowUseCase(params);

  if (pipe(workflowResult, (r) => r._tag === "Left")) {
    return workflowResult;
  }

  // Then trigger Inngest execution
  return pipe(
    tryCatch(
      async () => {
        await sendWorkflowExecution({
          workflowId: params.id,
        });
        return workflowResult.right;
      },
      (error) => workflowResult.left,
    ),
  )();
}
