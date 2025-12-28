"use server";

import { ApiEither } from "@/feature/common/data/api-task";
import { connection } from "next/server";
import getWorkflowsUseCase from "@/feature/core/workflow/domain/usecase/get-workflows.usecase";
import { GetWorkflowsParams } from "@/feature/core/workflow/domain/i-repo/workflow.repository.interface";
import WithPagination from "@/feature/common/class-helpers/with-pagination";
import Workflow from "@/feature/core/workflow/domain/entity/workflow.entity";

export default async function getWorkflowsController(
  params: GetWorkflowsParams,
): Promise<ApiEither<WithPagination<Workflow>>> {
  await connection();
  return await getWorkflowsUseCase(params);
}
