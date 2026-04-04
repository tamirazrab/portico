"use server";

import { connection } from "next/server";
import type { ApiEither } from "@/feature/common/data/api-task";
import type Workflow from "@/feature/core/workflow/domain/entity/workflow.entity";
import type { UpdateWorkflowParams } from "@/feature/core/workflow/domain/i-repo/workflow.repository.interface";
import updateWorkflowUseCase from "@/feature/core/workflow/domain/usecase/update-workflow.usecase";

export default async function updateWorkflowController(
  params: UpdateWorkflowParams,
): Promise<ApiEither<Workflow>> {
  await connection();
  return await updateWorkflowUseCase(params);
}
