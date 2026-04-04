import "server-only";
import type ApiTask from "@/feature/common/data/api-task";
import { diResolve } from "@/feature/common/features.di";
import { authModuleKey } from "@/feature/generic/auth/auth-module-key";
import type { AuthProfileParams } from "@/feature/generic/auth/domain/entity/auth-profile.enity";
import type AuthRepo from "@/feature/generic/auth/domain/i-repo/auth.repository";
import { authRepoKey } from "@/feature/generic/auth/domain/i-repo/auth.repository";

export default function getCachedProfile(): ApiTask<AuthProfileParams> {
  const repo = diResolve<AuthRepo>(authModuleKey, authRepoKey);
  return repo.getCachedProfile();
}
