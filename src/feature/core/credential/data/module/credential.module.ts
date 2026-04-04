import type { DependencyContainer } from "tsyringe";
import CredentialRepositoryImpl from "@/feature/core/credential/data/repository/credential.repository";
import { credentialRepoKey } from "@/feature/core/credential/domain/i-repo/credential.repository.interface";

export default function credentialModule(di: DependencyContainer) {
  di.register(credentialRepoKey, CredentialRepositoryImpl);
  return di;
}
