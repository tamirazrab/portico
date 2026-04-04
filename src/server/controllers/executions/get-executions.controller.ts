"use server";

import { connection } from "next/server";
import type WithPagination from "@/feature/common/class-helpers/with-pagination";
import type { ApiEither } from "@/feature/common/data/api-task";
import type {
  ExecutionWithWorkflow,
  GetExecutionsParams,
} from "@/feature/core/execution/domain/i-repo/execution.repository.interface";
import getExecutionsUseCase from "@/feature/core/execution/domain/usecase/get-executions.usecase";

export default async function getExecutionsController(
  params: GetExecutionsParams,
): Promise<ApiEither<WithPagination<ExecutionWithWorkflow>>> {
  await connection();
  return await getExecutionsUseCase(params);
}
