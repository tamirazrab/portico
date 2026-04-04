"use server";

import { connection } from "next/server";
import type { ApiEither } from "@/feature/common/data/api-task";
import deleteWorkflowUseCase from "@/feature/core/workflow/domain/usecase/delete-workflow.usecase";

export default async function deleteWorkflowController(params: {
  id: string;
  userId: string;
}): Promise<ApiEither<true>> {
  await connection();
  return await deleteWorkflowUseCase(params);
}
