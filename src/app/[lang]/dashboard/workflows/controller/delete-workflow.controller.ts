"use server";

import { ApiEither } from "@/feature/common/data/api-task";
import { connection } from "next/server";
import deleteWorkflowUseCase from "@/feature/core/workflow/domain/usecase/delete-workflow.usecase";

export default async function deleteWorkflowController(params: {
  id: string;
  userId: string;
}): Promise<ApiEither<true>> {
  await connection();
  return await deleteWorkflowUseCase(params);
}
