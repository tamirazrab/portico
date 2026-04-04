"use server";

import { connection } from "next/server";
import type { ApiEither } from "@/feature/common/data/api-task";
import type Workflow from "@/feature/core/workflow/domain/entity/workflow.entity";
import updateWorkflowNameUseCase from "@/feature/core/workflow/domain/usecase/update-workflow-name.usecase";

export default async function updateWorkflowNameController(params: {
  id: string;
  userId: string;
  name: string;
}): Promise<ApiEither<Workflow>> {
  await connection();
  return await updateWorkflowNameUseCase(params);
}
