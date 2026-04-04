"use server";

import { connection } from "next/server";
import type { ApiEither } from "@/feature/common/data/api-task";
import type Credential from "@/feature/core/credential/domain/entity/credential.entity";
import type { UpdateCredentialParams } from "@/feature/core/credential/domain/i-repo/credential.repository.interface";
import updateCredentialUseCase from "@/feature/core/credential/domain/usecase/update-credential.usecase";

export default async function updateCredentialController(
  params: UpdateCredentialParams,
): Promise<ApiEither<Credential>> {
  await connection();
  return await updateCredentialUseCase(params);
}
