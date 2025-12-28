"use server";

import { ApiEither } from "@/feature/common/data/api-task";
import { connection } from "next/server";
import createCredentialUseCase from "@/feature/core/credential/domain/usecase/create-credential.usecase";
import { CreateCredentialParams } from "@/feature/core/credential/domain/i-repo/credential.repository.interface";
import Credential from "@/feature/core/credential/domain/entity/credential.entity";

export default async function createCredentialController(
  params: CreateCredentialParams,
): Promise<ApiEither<Credential>> {
  await connection();
  return await createCredentialUseCase(params);
}
