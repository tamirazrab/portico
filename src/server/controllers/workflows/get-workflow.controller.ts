"use server";

import { connection } from "next/server";
import type { ApiEither } from "@/feature/common/data/api-task";
import type {
  GetWorkflowParams,
  WorkflowWithNodesAndConnections,
} from "@/feature/core/workflow/domain/i-repo/workflow.repository.interface";
import getWorkflowUseCase from "@/feature/core/workflow/domain/usecase/get-workflow.usecase";

export default async function getWorkflowController(
  params: GetWorkflowParams,
): Promise<ApiEither<WorkflowWithNodesAndConnections>> {
  await connection();
  return await getWorkflowUseCase(params);
}
