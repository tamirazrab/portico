import BetterAuthRepository from "@/feature/generic/auth/data/repo/better-auth.repository";
import { authRepoKey } from "@/feature/generic/auth/domain/i-repo/auth.repository";
import { DependencyContainer } from "tsyringe";

export default function authModule(di: DependencyContainer) {
  di.register(authRepoKey, BetterAuthRepository);
  return di;
}
