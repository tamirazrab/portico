"use server";

import { ApiEither } from "@/feature/common/data/api-task";
import { connection } from "next/server";
import getWorkflowUseCase from "@/feature/core/workflow/domain/usecase/get-workflow.usecase";
import { GetWorkflowParams, WorkflowWithNodesAndConnections } from "@/feature/core/workflow/domain/i-repo/workflow.repository.interface";

export default async function getWorkflowController(
  params: GetWorkflowParams,
): Promise<ApiEither<WorkflowWithNodesAndConnections>> {
  await connection();
  return await getWorkflowUseCase(params);
}

