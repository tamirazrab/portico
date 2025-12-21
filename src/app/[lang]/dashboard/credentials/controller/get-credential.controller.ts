"use server";

import { ApiEither } from "@/feature/common/data/api-task";
import { connection } from "next/server";
import getCredentialUseCase from "@/feature/core/credential/domain/usecase/get-credential.usecase";
import { GetCredentialParams } from "@/feature/core/credential/domain/i-repo/credential.repository.interface";
import Credential from "@/feature/core/credential/domain/entity/credential.entity";

export default async function getCredentialController(
  params: GetCredentialParams,
): Promise<ApiEither<Credential>> {
  await connection();
  return await getCredentialUseCase(params);
}

