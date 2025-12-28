import { ApiEither } from "@/feature/common/data/api-task";
import { diResolve } from "@/feature/common/features.di";
import { credentialModuleKey } from "@/feature/core/credential/data/credential-module-key";
import CredentialRepository, {
  credentialRepoKey,
  GetCredentialsByTypeParams,
} from "@/feature/core/credential/domain/i-repo/credential.repository.interface";
import Credential from "../entity/credential.entity";

export default async function getCredentialsByTypeUseCase(
  params: GetCredentialsByTypeParams,
): Promise<ApiEither<Credential[]>> {
  const repo = diResolve<CredentialRepository>(
    credentialModuleKey,
    credentialRepoKey,
  );
  return repo.getByType(params)();
}
