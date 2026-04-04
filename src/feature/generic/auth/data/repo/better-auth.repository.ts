import "server-only";
import { pipe } from "fp-ts/lib/function";
import { tryCatch } from "fp-ts/lib/TaskEither";
import { headers } from "next/headers";
import { auth } from "@/bootstrap/boundaries/auth/better-auth";
import type ApiTask from "@/feature/common/data/api-task";
import { failureOr } from "@/feature/common/failures/failure-helpers";
import Role from "@/feature/core/user/domain/entity/enum/role.enum";
import type AuthProfile from "@/feature/generic/auth/domain/entity/auth-profile.enity";
import type { AuthProfileParams } from "@/feature/generic/auth/domain/entity/auth-profile.enity";
import AuthToken from "@/feature/generic/auth/domain/entity/auth-token.entity";
import AuthCachedProfileFailure from "@/feature/generic/auth/domain/failure/auth-cached-profile-failure";
import AuthCachedTokenFailure from "@/feature/generic/auth/domain/failure/auth-cached-token-failure";
import AuthProfileFailure from "@/feature/generic/auth/domain/failure/auth-profile-failure";
import AuthTokenFailure from "@/feature/generic/auth/domain/failure/auth-token-failure";
import type AuthRepo from "@/feature/generic/auth/domain/i-repo/auth.repository";

export default class BetterAuthRepository implements AuthRepo {
  exchangeCodeWithToken(_code: string): ApiTask<AuthToken> {
    // Better Auth doesn't use code exchange, this is for OAuth flows
    // Return left with failure
    return pipe(
      tryCatch(
        async () => {
          throw new Error("Code exchange not supported in Better Auth");
        },
        () =>
          new AuthTokenFailure({
            reason: "Code exchange not supported in Better Auth",
          }),
      ),
    );
  }

  fetchProfileByToken(_token: AuthToken): ApiTask<AuthProfile> {
    // Better Auth manages sessions through cookies, not tokens
    // Use getCachedProfile instead
    return pipe(
      tryCatch(
        async () => {
          throw new Error(
            "Token-based profile fetch not supported in Better Auth",
          );
        },
        () =>
          new AuthProfileFailure({
            reason: "Token-based profile fetch not supported in Better Auth",
          }),
      ),
    );
  }

  getCachedProfile(): ApiTask<AuthProfileParams> {
    return pipe(
      tryCatch(
        async () => {
          const session = await auth.api.getSession({
            headers: await headers(),
          });

          if (!session || !session.user) {
            throw new Error("No session found");
          }

          const { user } = session;

          // Map Better Auth user to AuthProfile
          return {
            id: user.id,
            name: user.name || "",
            avatar: user.image || "",
            username: user.email || "",
            role: Role.USER, // Better Auth doesn't have roles by default, set to USER
          } as AuthProfileParams;
        },
        (error) => failureOr(error, new AuthCachedProfileFailure()),
      ),
    );
  }

  getCachedToken(): ApiTask<AuthToken> {
    return pipe(
      tryCatch(
        async () => {
          const session = await auth.api.getSession({
            headers: await headers(),
          });

          if (!session || !session.session) {
            throw new Error("No session found");
          }

          // Better Auth uses session tokens, create AuthToken from session
          return new AuthToken({
            accessToken: session.session.token || "",
            expiresIn: session.session.expiresAt
              ? Math.floor(
                  (new Date(session.session.expiresAt).getTime() - Date.now()) /
                    1000,
                )
              : 3600,
            tokenType: "Bearer",
          });
        },
        (error) => failureOr(error, new AuthCachedTokenFailure()),
      ),
    );
  }

  logout(): ApiTask<true> {
    return pipe(
      tryCatch(
        async () => {
          await auth.api.signOut({
            headers: await headers(),
          });
          return true;
        },
        (error) => failureOr(error, new AuthTokenFailure({ reason: error })),
      ),
    ) as ApiTask<true>;
  }
}
