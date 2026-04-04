"use server";

import { connection } from "next/server";
import type { ApiEither } from "@/feature/common/data/api-task";
import type Credential from "@/feature/core/credential/domain/entity/credential.entity";
import type { GetCredentialParams } from "@/feature/core/credential/domain/i-repo/credential.repository.interface";
import getCredentialUseCase from "@/feature/core/credential/domain/usecase/get-credential.usecase";

export default async function getCredentialController(
  params: GetCredentialParams,
): Promise<ApiEither<Credential>> {
  await connection();
  return await getCredentialUseCase(params);
}
