import "server-only";
import { PrismaClient } from "@/generated/prisma/client";
import { PRISMA_CLIENT_KEY } from "@/feature/common/data/global.module";
import ApiTask from "@/feature/common/data/api-task";
import { failureOr } from "@/feature/common/failures/failure-helpers";
import NetworkFailure from "@/feature/common/failures/network.failure";
import WithPagination from "@/feature/common/class-helpers/with-pagination";
import featuresDi from "@/feature/common/features.di";
import ExecutionRepository, {
  CreateExecutionParams,
  UpdateExecutionStatusParams,
  GetExecutionsParams,
  GetExecutionParams,
  GetExecutionByInngestEventIdParams,
  ExecutionWithWorkflow,
} from "@/feature/core/execution/domain/i-repo/execution.repository.interface";
import ExecutionStatus from "@/feature/core/execution/domain/enum/execution-status.enum";
import { pipe } from "fp-ts/lib/function";
import { tryCatch } from "fp-ts/lib/TaskEither";
import { executionModuleKey } from "../execution-module-key";
import ExecutionMapper from "./execution.mapper";

export default class ExecutionRepositoryImpl implements ExecutionRepository {
  private prisma: PrismaClient;

  constructor() {
    const di = featuresDi(executionModuleKey);
    this.prisma = di.resolve<PrismaClient>(PRISMA_CLIENT_KEY);
  }

  create(
    params: CreateExecutionParams,
  ): ApiTask<import("../domain/entity/execution.entity").default> {
    return pipe(
      tryCatch(
        async () => {
          const dbExecution = await this.prisma.execution.create({
            data: {
              workflowId: params.workflowId,
              inngestEventId: params.inngestEventId,
            },
          });
          return ExecutionMapper.toEntity(dbExecution);
        },
        (error) => failureOr(error, new NetworkFailure(error as Error)),
      ),
    );
  }

  updateStatus(
    params: UpdateExecutionStatusParams,
  ): ApiTask<import("../domain/entity/execution.entity").default> {
    return pipe(
      tryCatch(
        async () => {
          const dbExecution = await this.prisma.execution.update({
            where: { id: params.id },
            data: {
              status: params.status as ExecutionStatus,
              ...(params.error && { error: params.error }),
              ...(params.errorStack && { errorStack: params.errorStack }),
              ...(params.output && { output: params.output }),
              ...(params.status !== ExecutionStatus.RUNNING && {
                completedAt: new Date(),
              }),
            },
          });
          return ExecutionMapper.toEntity(dbExecution);
        },
        (error) => failureOr(error, new NetworkFailure(error as Error)),
      ),
    );
  }

  getOne(params: GetExecutionParams): ApiTask<ExecutionWithWorkflow> {
    return pipe(
      tryCatch(
        async () => {
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
          return ExecutionMapper.toEntityWithWorkflow(dbExecution);
        },
        (error) => failureOr(error, new NetworkFailure(error as Error)),
      ),
    );
  }

  updateStatusByInngestEventId(
    params: {
      inngestEventId: string;
    } & Omit<UpdateExecutionStatusParams, "id">,
  ): ApiTask<import("../domain/entity/execution.entity").default> {
    return pipe(
      tryCatch(
        async () => {
          const dbExecution = await this.prisma.execution.update({
            where: { inngestEventId: params.inngestEventId },
            data: {
              status: params.status as ExecutionStatus,
              ...(params.error && { error: params.error }),
              ...(params.errorStack && { errorStack: params.errorStack }),
              ...(params.output && { output: params.output }),
              ...(params.status !== ExecutionStatus.RUNNING && {
                completedAt: new Date(),
              }),
            },
          });
          return ExecutionMapper.toEntity(dbExecution);
        },
        (error) => failureOr(error, new NetworkFailure(error as Error)),
      ),
    );
  }

  getOneByInngestEventId(
    params: GetExecutionByInngestEventIdParams,
  ): ApiTask<import("../domain/entity/execution.entity").default> {
    return pipe(
      tryCatch(
        async () => {
          const dbExecution = await this.prisma.execution.findUniqueOrThrow({
            where: { inngestEventId: params.inngestEventId },
          });
          return ExecutionMapper.toEntity(dbExecution);
        },
        (error) => failureOr(error, new NetworkFailure(error as Error)),
      ),
    );
  }

  getMany(
    params: GetExecutionsParams,
  ): ApiTask<WithPagination<ExecutionWithWorkflow>> {
    return pipe(
      tryCatch(
        async () => {
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

          return ExecutionMapper.toPaginatedEntity(dbExecutions, total);
        },
        (error) => failureOr(error, new NetworkFailure(error as Error)),
      ),
    );
  }
}
