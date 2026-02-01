"use server";

import type { ApiEither } from "@/feature/common/data/api-task";
import { connection } from "next/server";
import getCredentialsUseCase from "@/feature/core/credential/domain/usecase/get-credentials.usecase";
import type { GetCredentialsParams } from "@/feature/core/credential/domain/i-repo/credential.repository.interface";
import type WithPagination from "@/feature/common/class-helpers/with-pagination";
import type Credential from "@/feature/core/credential/domain/entity/credential.entity";

export default async function getCredentialsController(
  params: GetCredentialsParams,
): Promise<ApiEither<WithPagination<Credential>>> {
  await connection();
  return await getCredentialsUseCase(params);
}

