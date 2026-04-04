import "server-only";
import { left, right } from "fp-ts/lib/Either";
import type WithPagination from "@/feature/common/class-helpers/with-pagination";
import type { ApiEither } from "@/feature/common/data/api-task";
import { PRISMA_CLIENT_KEY } from "@/feature/common/data/global.module";
import { failureOr } from "@/feature/common/failures/failure-helpers";
import NetworkFailure from "@/feature/common/failures/network.failure";
import featuresDi from "@/feature/common/features.di";
import type Execution from "@/feature/core/execution/domain/entity/execution.entity";
import ExecutionStatus from "@/feature/core/execution/domain/enum/execution-status.enum";
import type ExecutionRepository from "@/feature/core/execution/domain/i-repo/execution.repository.interface";
import type {
  CreateExecutionParams,
  ExecutionWithWorkflow,
  GetExecutionByInngestEventIdParams,
  GetExecutionParams,
  GetExecutionsParams,
  UpdateExecutionStatusParams,
} from "@/feature/core/execution/domain/i-repo/execution.repository.interface";
import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import { executionModuleKey } from "../execution-module-key";
import ExecutionMapper from "./execution.mapper";

export default class ExecutionRepositoryImpl implements ExecutionRepository {
  private prisma: PrismaClient;

  constructor() {
    const di = featuresDi(executionModuleKey);
    this.prisma = di.resolve<PrismaClient>(PRISMA_CLIENT_KEY);
  }

  async create(params: CreateExecutionParams): Promise<ApiEither<Execution>> {
    try {
      const dbExecution = await this.prisma.execution.create({
        data: {
          workflowId: params.workflowId,
          inngestEventId: params.inngestEventId,
        },
      });
      return right(ExecutionMapper.toEntity(dbExecution));
    } catch (error) {
      return left(failureOr(error, new NetworkFailure(error as Error)));
    }
  }

  async updateStatus(
    params: UpdateExecutionStatusParams,
  ): Promise<ApiEither<Execution>> {
    try {
      const dbExecution = await this.prisma.execution.update({
        where: { id: params.id },
        data: {
          status: params.status as ExecutionStatus,
          ...(params.error && { error: params.error }),
          ...(params.errorStack && { errorStack: params.errorStack }),
          ...(params.output && {
            output: params.output as Prisma.InputJsonValue,
          }),
          ...(params.status !== ExecutionStatus.RUNNING && {
            completedAt: new Date(),
          }),
        },
      });
      return right(ExecutionMapper.toEntity(dbExecution));
    } catch (error) {
      return left(failureOr(error, new NetworkFailure(error as Error)));
    }
  }

  async getOne(
    params: GetExecutionParams,
  ): Promise<ApiEither<ExecutionWithWorkflow>> {
    try {
      const dbExecution = await this.prisma.execution.findFirstOrThrow({
        where: {
          id: params.id,
          workflow: {
            userId: params.userId,
          },
        },
        include: {
          workflow: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      return right(ExecutionMapper.toEntityWithWorkflow(dbExecution));
    } catch (error) {
      return left(failureOr(error, new NetworkFailure(error as Error)));
    }
  }

  async updateStatusByInngestEventId(
    params: {
      inngestEventId: string;
    } & Omit<UpdateExecutionStatusParams, "id">,
  ): Promise<ApiEither<Execution>> {
    try {
      const dbExecution = await this.prisma.execution.update({
        where: { inngestEventId: params.inngestEventId },
        data: {
          status: params.status as ExecutionStatus,
          ...(params.error && { error: params.error }),
          ...(params.errorStack && { errorStack: params.errorStack }),
          ...(params.output && {
            output: params.output as Prisma.InputJsonValue,
          }),
          ...(params.status !== ExecutionStatus.RUNNING && {
            completedAt: new Date(),
          }),
        },
      });
      return right(ExecutionMapper.toEntity(dbExecution));
    } catch (error) {
      return left(failureOr(error, new NetworkFailure(error as Error)));
    }
  }

  async getOneByInngestEventId(
    params: GetExecutionByInngestEventIdParams,
  ): Promise<ApiEither<Execution>> {
    try {
      const dbExecution = await this.prisma.execution.findUniqueOrThrow({
        where: { inngestEventId: params.inngestEventId },
      });
      return right(ExecutionMapper.toEntity(dbExecution));
    } catch (error) {
      return left(failureOr(error, new NetworkFailure(error as Error)));
    }
  }

  async getMany(
    params: GetExecutionsParams,
  ): Promise<ApiEither<WithPagination<ExecutionWithWorkflow>>> {
    try {
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const skip = (page - 1) * pageSize;

      const [dbExecutions, total] = await Promise.all([
        this.prisma.execution.findMany({
          where: {
            workflow: {
              userId: params.userId,
            },
          },
          skip,
          take: pageSize,
          orderBy: {
            startedAt: "desc",
          },
          include: {
            workflow: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        this.prisma.execution.count({
          where: {
            workflow: {
              userId: params.userId,
            },
          },
        }),
      ]);

      return right(ExecutionMapper.toPaginatedEntity(dbExecutions, total));
    } catch (error) {
      return left(failureOr(error, new NetworkFailure(error as Error)));
    }
  }
}
