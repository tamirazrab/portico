import { ApiEither } from "@/feature/common/data/api-task";
import { diResolve } from "@/feature/common/features.di";
import { credentialModuleKey } from "@/feature/core/credential/data/credential-module-key";
import CredentialRepository, {
  credentialRepoKey,
  CreateCredentialParams,
} from "@/feature/core/credential/domain/i-repo/credential.repository.interface";

export default async function createCredentialUseCase(
  params: CreateCredentialParams,
): Promise<ApiEither<import("../entity/credential.entity").default>> {
  const repo = diResolve<CredentialRepository>(
    credentialModuleKey,
    credentialRepoKey,
  );
  return repo.create(params)();
}
