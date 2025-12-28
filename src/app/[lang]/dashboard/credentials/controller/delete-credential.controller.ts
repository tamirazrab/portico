"use server";

import { ApiEither } from "@/feature/common/data/api-task";
import { connection } from "next/server";
import deleteCredentialUseCase from "@/feature/core/credential/domain/usecase/delete-credential.usecase";

export default async function deleteCredentialController(params: {
  id: string;
  userId: string;
}): Promise<ApiEither<true>> {
  await connection();
  return await deleteCredentialUseCase(params);
}
