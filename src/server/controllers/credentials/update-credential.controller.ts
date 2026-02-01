"use server";

import { ApiEither } from "@/feature/common/data/api-task";
import { connection } from "next/server";
import updateCredentialUseCase from "@/feature/core/credential/domain/usecase/update-credential.usecase";
import { UpdateCredentialParams } from "@/feature/core/credential/domain/i-repo/credential.repository.interface";
import Credential from "@/feature/core/credential/domain/entity/credential.entity";

export default async function updateCredentialController(
  params: UpdateCredentialParams,
): Promise<ApiEither<Credential>> {
  await connection();
  return await updateCredentialUseCase(params);
}

