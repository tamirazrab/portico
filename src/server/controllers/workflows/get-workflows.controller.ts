"use server";

import { connection } from "next/server";
import type WithPagination from "@/feature/common/class-helpers/with-pagination";
import type { ApiEither } from "@/feature/common/data/api-task";
import type Workflow from "@/feature/core/workflow/domain/entity/workflow.entity";
import type { GetWorkflowsParams } from "@/feature/core/workflow/domain/i-repo/workflow.repository.interface";
import getWorkflowsUseCase from "@/feature/core/workflow/domain/usecase/get-workflows.usecase";

export default async function getWorkflowsController(
  params: GetWorkflowsParams,
): Promise<ApiEither<WithPagination<Workflow>>> {
  await connection();
  return await getWorkflowsUseCase(params);
}
