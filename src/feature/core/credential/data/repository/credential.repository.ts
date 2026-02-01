import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import { PRISMA_CLIENT_KEY } from "@/feature/common/data/global.module";
import type { ApiEither } from "@/feature/common/data/api-task";
import { failureOr } from "@/feature/common/failures/failure-helpers";
import NetworkFailure from "@/feature/common/failures/network.failure";
import type WithPagination from "@/feature/common/class-helpers/with-pagination";
import featuresDi from "@/feature/common/features.di";
import type CredentialRepository from "@/feature/core/credential/domain/i-repo/credential.repository.interface";
import type Credential from "@/feature/core/credential/domain/entity/credential.entity";
import type CredentialType from "@/feature/core/credential/domain/enum/credential-type.enum";
import { encrypt } from "@/bootstrap/helpers/encryption/encryption";
import { left, right } from "fp-ts/lib/Either";
import { credentialModuleKey } from "../credential-module-key";
import CredentialMapper from "./credential.mapper";
import type { CreateCredentialParams, UpdateCredentialParams, GetCredentialParams, GetCredentialsParams, GetCredentialsByTypeParams } from "@/feature/core/credential/domain/i-repo/credential.repository.interface";

export default class CredentialRepositoryImpl implements CredentialRepository {
  private prisma: PrismaClient;

  constructor() {
    const di = featuresDi(credentialModuleKey);
    this.prisma = di.resolve<PrismaClient>(PRISMA_CLIENT_KEY);
  }

  async create(params: CreateCredentialParams): Promise<ApiEither<Credential>> {
    try {
      const dbCredential = await this.prisma.credentials.create({
        data: {
          name: params.name,
          value: encrypt(params.value),
          type: params.type as CredentialType,
          userId: params.userId,
        },
      });
      return right(CredentialMapper.toEntity(dbCredential));
    } catch (error) {
      return left(failureOr(error, new NetworkFailure(error as Error)));
    }
  }

  async update(params: UpdateCredentialParams): Promise<ApiEither<Credential>> {
    try {
      const dbCredential = await this.prisma.credentials.update({
        where: {
          id: params.id,
          userId: params.userId,
        },
        data: {
          name: params.name,
          value: encrypt(params.value),
          type: params.type as CredentialType,
        },
      });
      return right(CredentialMapper.toEntity(dbCredential));
    } catch (error) {
      return left(failureOr(error, new NetworkFailure(error as Error)));
    }
  }

  async delete(params: { id: string; userId: string }): Promise<ApiEither<true>> {
    try {
      await this.prisma.credentials.delete({
        where: {
          id: params.id,
          userId: params.userId,
        },
      });
      return right(true);
    } catch (error) {
      return left(failureOr(error, new NetworkFailure(error as Error)));
    }
  }

  async getOne(params: GetCredentialParams): Promise<ApiEither<Credential>> {
    try {
      const dbCredential = await this.prisma.credentials.findUniqueOrThrow({
        where: {
          id: params.id,
          userId: params.userId,
        },
      });
      return right(CredentialMapper.toEntity(dbCredential));
    } catch (error) {
      return left(failureOr(error, new NetworkFailure(error as Error)));
    }
  }

  async getMany(params: GetCredentialsParams): Promise<ApiEither<WithPagination<Credential>>> {
    try {
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

      return right(CredentialMapper.toPaginatedEntity(dbCredentials, total));
    } catch (error) {
      return left(failureOr(error, new NetworkFailure(error as Error)));
    }
  }

  async getByType(params: GetCredentialsByTypeParams): Promise<ApiEither<Credential[]>> {
    try {
      const dbCredentials = await this.prisma.credentials.findMany({
        where: {
          userId: params.userId,
          type: params.type as CredentialType,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
      return right(dbCredentials.map((cred) => CredentialMapper.toEntity(cred)));
    } catch (error) {
      return left(failureOr(error, new NetworkFailure(error as Error)));
    }
  }
}
