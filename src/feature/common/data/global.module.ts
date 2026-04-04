import type { DependencyContainer } from "tsyringe";
import prisma from "@/bootstrap/boundaries/db/prisma";
import FetchHandler from "@/feature/common/data/fetch-handler";
import AuthIDPRepo from "@/feature/generic/auth/data/repo/auth.repository";
import { authRepoKey } from "@/feature/generic/auth/domain/i-repo/auth.repository";
import type { PrismaClient } from "@/generated/prisma/client";

export const PRISMA_CLIENT_KEY = "PrismaClient";

export default function globalModule(di: DependencyContainer) {
  const globalDi = di.createChildContainer();

  globalDi.register(authRepoKey, AuthIDPRepo);
  globalDi.register(FetchHandler, FetchHandler);
  globalDi.register<PrismaClient>(PRISMA_CLIENT_KEY, {
    useValue: prisma,
  });
  return globalDi;
}
