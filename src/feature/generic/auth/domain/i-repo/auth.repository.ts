import type ApiTask from "@/feature/common/data/api-task";
import type AuthProfile from "@/feature/generic/auth/domain/entity/auth-profile.enity";
import type { AuthProfileParams } from "@/feature/generic/auth/domain/entity/auth-profile.enity";
import type AuthToken from "@/feature/generic/auth/domain/entity/auth-token.entity";

export default interface AuthRepo {
  exchangeCodeWithToken(code: string): ApiTask<AuthToken>;
  fetchProfileByToken(token: AuthToken): ApiTask<AuthProfile>;
  getCachedProfile(): ApiTask<AuthProfileParams>;
  getCachedToken(): ApiTask<AuthToken>;
  logout(): ApiTask<true>;
}

export const authRepoKey = "authRepoKey";
