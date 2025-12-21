"use server";

import { ApiEither } from "@/feature/common/data/api-task";
import { connection } from "next/server";
import updateWorkflowUseCase from "@/feature/core/workflow/domain/usecase/update-workflow.usecase";
import { UpdateWorkflowParams } from "@/feature/core/workflow/domain/i-repo/workflow.repository.interface";
import Workflow from "@/feature/core/workflow/domain/entity/workflow.entity";

export default async function updateWorkflowController(
  params: UpdateWorkflowParams,
): Promise<ApiEither<Workflow>> {
  await connection();
  return await updateWorkflowUseCase(params);
}

