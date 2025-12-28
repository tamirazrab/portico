import { ApiEither } from "@/feature/common/data/api-task";
import { diResolve } from "@/feature/common/features.di";
import WithPagination from "@/feature/common/class-helpers/with-pagination";
import { credentialModuleKey } from "@/feature/core/credential/data/credential-module-key";
import CredentialRepository, {
  credentialRepoKey,
  GetCredentialsParams,
} from "@/feature/core/credential/domain/i-repo/credential.repository.interface";
import Credential from "../entity/credential.entity";

export default async function getCredentialsUseCase(
  params: GetCredentialsParams,
): Promise<ApiEither<WithPagination<Credential>>> {
  const repo = diResolve<CredentialRepository>(
    credentialModuleKey,
    credentialRepoKey,
  );
  return repo.getMany(params)();
}
