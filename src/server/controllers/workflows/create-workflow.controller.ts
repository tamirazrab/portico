"use server";

import { connection } from "next/server";
import type { ApiEither } from "@/feature/common/data/api-task";
import type Workflow from "@/feature/core/workflow/domain/entity/workflow.entity";
import type { CreateWorkflowParams } from "@/feature/core/workflow/domain/i-repo/workflow.repository.interface";
import createWorkflowUseCase from "@/feature/core/workflow/domain/usecase/create-workflow.usecase";

/**
 * Controllers are bridge between feature layer and application layer.
 * They decide, feature layer will be cached or not, where to run in client or server
 * Or connect multiple usecases and run them, handle their failure, hydrate and store data in
 *  client state managements.
 */
export default async function createWorkflowController(
  params: CreateWorkflowParams,
): Promise<ApiEither<Workflow>> {
  await connection();
  return await createWorkflowUseCase(params);
}
