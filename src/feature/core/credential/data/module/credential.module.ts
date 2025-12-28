import CredentialRepositoryImpl from "@/feature/core/credential/data/repository/credential.repository";
import { credentialRepoKey } from "@/feature/core/credential/domain/i-repo/credential.repository.interface";
import { DependencyContainer } from "tsyringe";

export default function credentialModule(di: DependencyContainer) {
  di.register(credentialRepoKey, CredentialRepositoryImpl);
  return di;
}
