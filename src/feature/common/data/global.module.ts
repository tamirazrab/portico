import { DependencyContainer } from "tsyringe";
import { authRepoKey } from "@/feature/generic/auth/domain/i-repo/auth.repository";
import AuthIDPRepo from "@/feature/generic/auth/data/repo/auth.repository";
import FetchHandler from "@/feature/common/data/fetch-handler";
import prisma from "@/bootstrap/boundaries/db/prisma";
import { PrismaClient } from "@/generated/prisma/client";

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
