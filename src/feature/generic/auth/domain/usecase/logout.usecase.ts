import "server-only";
import { diResolve } from "@/feature/common/features.di";
import { authModuleKey } from "@/feature/generic/auth/auth-module-key";
import type AuthRepo from "@/feature/generic/auth/domain/i-repo/auth.repository";
import { authRepoKey } from "@/feature/generic/auth/domain/i-repo/auth.repository";

export default function logoutUsecase() {
  const repo = diResolve<AuthRepo>(authModuleKey, authRepoKey);

  return repo.logout();
}
