import "server-only";
import { PrismaClient } from "@/generated/prisma/client";
import { PRISMA_CLIENT_KEY } from "@/feature/common/data/global.module";
import ApiTask from "@/feature/common/data/api-task";
import { failureOr } from "@/feature/common/failures/failure-helpers";
import NetworkFailure from "@/feature/common/failures/network.failure";
import WithPagination from "@/feature/common/class-helpers/with-pagination";
import CredentialMapper from "./credential.mapper";
import { credentialModuleKey } from "../credential-module-key";
import featuresDi from "@/feature/common/features.di";
import CredentialRepository, {
  CreateCredentialParams,
  UpdateCredentialParams,
  GetCredentialsParams,
  GetCredentialParams,
  GetCredentialsByTypeParams,
} from "@/feature/core/credential/domain/i-repo/credential.repository.interface";
import Credential from "@/feature/core/credential/domain/entity/credential.entity";
import CredentialType from "@/feature/core/credential/domain/enum/credential-type.enum";
import { encrypt } from "@/bootstrap/helpers/encryption/encryption";
import { pipe } from "fp-ts/lib/function";
import { tryCatch } from "fp-ts/lib/TaskEither";

export default class CredentialRepositoryImpl implements CredentialRepository {
  private prisma: PrismaClient;

  constructor() {
    const di = featuresDi(credentialModuleKey);
    this.prisma = di.resolve<PrismaClient>(PRISMA_CLIENT_KEY);
  }

  create(params: CreateCredentialParams): ApiTask<Credential> {
    return pipe(
      tryCatch(
        async () => {
          const dbCredential = await this.prisma.credentials.create({
            data: {
              name: params.name,
              value: encrypt(params.value), // Encrypt before storing
              type: params.type as CredentialType,
              userId: params.userId,
            },
          });
          return CredentialMapper.toEntity(dbCredential);
        },
        (error) => failureOr(error, new NetworkFailure(error as Error)),
      ),
    );
  }

  update(params: UpdateCredentialParams): ApiTask<Credential> {
    return pipe(
      tryCatch(
        async () => {
          const dbCredential = await this.prisma.credentials.update({
            where: {
              id: params.id,
              userId: params.userId,
            },
            data: {
              name: params.name,
              value: encrypt(params.value), // Encrypt before storing
              type: params.type as CredentialType,
            },
          });
          return CredentialMapper.toEntity(dbCredential);
        },
        (error) => failureOr(error, new NetworkFailure(error as Error)),
      ),
    );
  }

  delete(params: { id: string; userId: string }): ApiTask<true> {
    return pipe(
      tryCatch(
        async () => {
          await this.prisma.credentials.delete({
            where: {
              id: params.id,
              userId: params.userId,
            },
          });
          return true;
        },
        (error) => failureOr(error, new NetworkFailure(error as Error)),
      ),
    );
  }

  getOne(params: GetCredentialParams): ApiTask<Credential> {
    return pipe(
      tryCatch(
        async () => {
          const dbCredential = await this.prisma.credentials.findUniqueOrThrow({
            where: {
              id: params.id,
              userId: params.userId,
            },
          });
          return CredentialMapper.toEntity(dbCredential);
        },
        (error) => failureOr(error, new NetworkFailure(error as Error)),
      ),
    );
  }

  getMany(params: GetCredentialsParams): ApiTask<WithPagination<Credential>> {
    return pipe(
      tryCatch(
        async () => {
          const page = params.page || 1;
          const pageSize = params.pageSize || 10;
          const skip = (page - 1) * pageSize;

          const where = {
            userId: params.userId,
            ...(params.search && {
              name: {
                contains: params.search,
                mode: "insensitive" as const,
              },
            }),
          };

          const [dbCredentials, total] = await Promise.all([
            this.prisma.credentials.findMany({
              where,
              skip,
              take: pageSize,
              orderBy: {
                createdAt: "desc",
              },
            }),
            this.prisma.credentials.count({ where }),
          ]);

          return CredentialMapper.toPaginatedEntity(dbCredentials, total);
        },
        (error) => failureOr(error, new NetworkFailure(error as Error)),
      ),
    );
  }

  getByType(params: GetCredentialsByTypeParams): ApiTask<Credential[]> {
    return pipe(
      tryCatch(
        async () => {
          const dbCredentials = await this.prisma.credentials.findMany({
            where: {
              userId: params.userId,
              type: params.type as CredentialType,
            },
            orderBy: {
              updatedAt: "desc",
            },
          });
          return dbCredentials.map((cred) => CredentialMapper.toEntity(cred));
        },
        (error) => failureOr(error, new NetworkFailure(error as Error)),
      ),
    );
  }
}

