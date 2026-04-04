"use server";

import { connection } from "next/server";
import type { ApiEither } from "@/feature/common/data/api-task";
import deleteCredentialUseCase from "@/feature/core/credential/domain/usecase/delete-credential.usecase";

export default async function deleteCredentialController(params: {
  id: string;
  userId: string;
}): Promise<ApiEither<true>> {
  await connection();
  return await deleteCredentialUseCase(params);
}
