"use server";

import { connection } from "next/server";
import type { ApiEither } from "@/feature/common/data/api-task";
import type Credential from "@/feature/core/credential/domain/entity/credential.entity";
import type { GetCredentialsByTypeParams } from "@/feature/core/credential/domain/i-repo/credential.repository.interface";
import getCredentialsByTypeUseCase from "@/feature/core/credential/domain/usecase/get-credentials-by-type.usecase";

export default async function getCredentialsByTypeController(
  params: GetCredentialsByTypeParams,
): Promise<ApiEither<Credential[]>> {
  await connection();
  return await getCredentialsByTypeUseCase(params);
}
