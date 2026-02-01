"use server";

import { ApiEither } from "@/feature/common/data/api-task";
import { connection } from "next/server";
import getExecutionsUseCase from "@/feature/core/execution/domain/usecase/get-executions.usecase";
import {
  GetExecutionsParams,
  ExecutionWithWorkflow,
} from "@/feature/core/execution/domain/i-repo/execution.repository.interface";
import WithPagination from "@/feature/common/class-helpers/with-pagination";

export default async function getExecutionsController(
  params: GetExecutionsParams,
): Promise<ApiEither<WithPagination<ExecutionWithWorkflow>>> {
  await connection();
  return await getExecutionsUseCase(params);
}

