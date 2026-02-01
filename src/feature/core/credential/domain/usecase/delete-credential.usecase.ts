import { ApiEither } from "@/feature/common/data/api-task";
import { diResolve } from "@/feature/common/features.di";
import { credentialModuleKey } from "@/feature/core/credential/data/credential-module-key";
import CredentialRepository, {
  credentialRepoKey,
} from "@/feature/core/credential/domain/i-repo/credential.repository.interface";

export default async function deleteCredentialUseCase(params: {
  id: string;
  userId: string;
}): Promise<ApiEither<true>> {
  const repo = diResolve<CredentialRepository>(
    credentialModuleKey,
    credentialRepoKey,
  );
  return repo.delete(params);
}
