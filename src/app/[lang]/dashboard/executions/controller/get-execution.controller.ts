"use server";

import { ApiEither } from "@/feature/common/data/api-task";
import { connection } from "next/server";
import getExecutionUseCase from "@/feature/core/execution/domain/usecase/get-execution.usecase";
import { GetExecutionParams, ExecutionWithWorkflow } from "@/feature/core/execution/domain/i-repo/execution.repository.interface";

export default async function getExecutionController(
  params: GetExecutionParams,
): Promise<ApiEither<ExecutionWithWorkflow>> {
  await connection();
  return await getExecutionUseCase(params);
}

