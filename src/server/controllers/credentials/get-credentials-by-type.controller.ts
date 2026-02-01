"use server";

import type { ApiEither } from "@/feature/common/data/api-task";
import { connection } from "next/server";
import getCredentialsByTypeUseCase from "@/feature/core/credential/domain/usecase/get-credentials-by-type.usecase";
import type { GetCredentialsByTypeParams } from "@/feature/core/credential/domain/i-repo/credential.repository.interface";
import type Credential from "@/feature/core/credential/domain/entity/credential.entity";

export default async function getCredentialsByTypeController(
  params: GetCredentialsByTypeParams,
): Promise<ApiEither<Credential[]>> {
  await connection();
  return await getCredentialsByTypeUseCase(params);
}

