import { PrismaClient } from "@/generated/prisma/client";
import WithPagination from "@/feature/common/class-helpers/with-pagination";
import Execution from "@/feature/core/execution/domain/entity/execution.entity";
import ExecutionStatus from "@/feature/core/execution/domain/enum/execution-status.enum";
import { ExecutionWithWorkflow } from "@/feature/core/execution/domain/i-repo/execution.repository.interface";

type ExecutionDbResponse = {
  id: string;
  workflowId: string;
  status: string;
  error: string | null;
  errorStack: string | null;
  startedAt: Date;
  completedAt: Date | null;
  inngestEventId: string;
  output: unknown;
  workflow?: {
    id: string;
    name: string;
  };
};

export default class ExecutionMapper {
  static toEntity(dbExecution: ExecutionDbResponse): Execution {
    return new Execution({
      id: dbExecution.id,
      workflowId: dbExecution.workflowId,
      status: dbExecution.status as ExecutionStatus,
      error: dbExecution.error || undefined,
      errorStack: dbExecution.errorStack || undefined,
      startedAt: dbExecution.startedAt,
      completedAt: dbExecution.completedAt || undefined,
      inngestEventId: dbExecution.inngestEventId,
      output: (dbExecution.output as Record<string, unknown>) || undefined,
    });
  }

  static toEntityWithWorkflow(dbExecution: ExecutionDbResponse): ExecutionWithWorkflow {
    const execution = ExecutionMapper.toEntity(dbExecution);
    return {
      ...execution,
      workflow: dbExecution.workflow || { id: dbExecution.workflowId, name: "" },
    };
  }

  static toPaginatedEntity(
    dbExecutions: ExecutionDbResponse[],
    total: number,
  ): WithPagination<ExecutionWithWorkflow> {
    const executions = dbExecutions.map((exec) =>
      ExecutionMapper.toEntityWithWorkflow(exec),
    );
    return new WithPagination(executions, total);
  }
}

