import { describe, it, expect } from "vitest";
import { faker } from "@faker-js/faker";
import ExecutionMapper from "@/feature/core/execution/data/repository/execution.mapper";
import Execution from "@/feature/core/execution/domain/entity/execution.entity";
import ExecutionStatus from "@/feature/core/execution/domain/enum/execution-status.enum";
import WithPagination from "@/feature/common/class-helpers/with-pagination";

describe("ExecutionMapper", () => {
  describe("toEntity", () => {
    it("Should map database response to Execution entity", () => {
      // Arrange
      const dbExecution = {
        id: faker.string.uuid(),
        workflowId: faker.string.uuid(),
        status: ExecutionStatus.SUCCESS,
        error: null,
        errorStack: null,
        startedAt: faker.date.past(),
        completedAt: faker.date.recent(),
        inngestEventId: faker.string.uuid(),
        output: { result: "success" },
      };

      // Act
      const result = ExecutionMapper.toEntity(dbExecution);

      // Assert
      expect(result).toBeInstanceOf(Execution);
      expect(result.id).toBe(dbExecution.id);
      expect(result.workflowId).toBe(dbExecution.workflowId);
      expect(result.status).toBe(dbExecution.status);
      expect(result.inngestEventId).toBe(dbExecution.inngestEventId);
    });

    it("Should handle failed execution with error", () => {
      // Arrange
      const dbExecution = {
        id: faker.string.uuid(),
        workflowId: faker.string.uuid(),
        status: ExecutionStatus.FAILED,
        error: "Test error",
        errorStack: "Error stack trace",
        startedAt: faker.date.past(),
        completedAt: faker.date.recent(),
        inngestEventId: faker.string.uuid(),
        output: null,
      };

      // Act
      const result = ExecutionMapper.toEntity(dbExecution);

      // Assert
      expect(result.status).toBe(ExecutionStatus.FAILED);
      expect(result.error).toBe("Test error");
      expect(result.errorStack).toBe("Error stack trace");
    });
  });

  describe("toPaginatedEntity", () => {
    it("Should map database executions to paginated entity", () => {
      // Arrange
      const dbExecutions = [
        {
          id: faker.string.uuid(),
          workflowId: faker.string.uuid(),
          status: ExecutionStatus.SUCCESS,
          error: null,
          errorStack: null,
          startedAt: faker.date.past(),
          completedAt: faker.date.recent(),
          inngestEventId: faker.string.uuid(),
          output: {},
          workflow: {
            id: faker.string.uuid(),
            name: faker.word.words(3),
          },
        },
      ];
      const total = 5;

      // Act
      const result = ExecutionMapper.toPaginatedEntity(dbExecutions, total);

      // Assert
      expect(result).toBeInstanceOf(WithPagination);
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(total);
    });
  });
});
