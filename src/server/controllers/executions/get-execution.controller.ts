"use server";

import { connection } from "next/server";
import type { ApiEither } from "@/feature/common/data/api-task";
import type {
  ExecutionWithWorkflow,
  GetExecutionParams,
} from "@/feature/core/execution/domain/i-repo/execution.repository.interface";
import getExecutionUseCase from "@/feature/core/execution/domain/usecase/get-execution.usecase";

export default async function getExecutionController(
  params: GetExecutionParams,
): Promise<ApiEither<ExecutionWithWorkflow>> {
  await connection();
  return await getExecutionUseCase(params);
}
