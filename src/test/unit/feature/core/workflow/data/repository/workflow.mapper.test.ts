import { describe, it, expect } from "vitest";
import { faker } from "@faker-js/faker";
import WorkflowMapper from "@/feature/core/workflow/data/repository/workflow.mapper";
import Workflow from "@/feature/core/workflow/domain/entity/workflow.entity";
import WorkflowNode from "@/feature/core/workflow/domain/entity/workflow-node.entity";
import WorkflowConnection from "@/feature/core/workflow/domain/entity/workflow-connection.entity";
import NodeType from "@/feature/core/workflow/domain/enum/node-type.enum";
import WithPagination from "@/feature/common/class-helpers/with-pagination";

describe("WorkflowMapper", () => {
  describe("toEntity", () => {
    it("Should map database response to Workflow entity", () => {
      // Arrange
      const dbWorkflow = {
        id: faker.string.uuid(),
        name: faker.word.words(3),
        userId: faker.string.uuid(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      };

      // Act
      const result = WorkflowMapper.toEntity(dbWorkflow);

      // Assert
      expect(result).toBeInstanceOf(Workflow);
      expect(result.id).toBe(dbWorkflow.id);
      expect(result.name).toBe(dbWorkflow.name);
      expect(result.userId).toBe(dbWorkflow.userId);
      expect(result.createdAt).toEqual(dbWorkflow.createdAt);
      expect(result.updatedAt).toEqual(dbWorkflow.updatedAt);
    });
  });

  describe("nodeToEntity", () => {
    it("Should map database node response to WorkflowNode entity", () => {
      // Arrange
      const dbNode = {
        id: faker.string.uuid(),
        workflowId: faker.string.uuid(),
        name: faker.word.words(2),
        type: NodeType.INITIAL,
        position: { x: 100, y: 200 },
        data: { test: "value" },
        credentialId: null,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      };

      // Act
      const result = WorkflowMapper.nodeToEntity(dbNode);

      // Assert
      expect(result).toBeInstanceOf(WorkflowNode);
      expect(result.id).toBe(dbNode.id);
      expect(result.type).toBe(dbNode.type);
      expect(result.position).toEqual(dbNode.position);
      expect(result.data).toEqual(dbNode.data);
    });
  });

  describe("connectionToEntity", () => {
    it("Should map database connection response to WorkflowConnection entity", () => {
      // Arrange
      const dbConnection = {
        id: faker.string.uuid(),
        workflowId: faker.string.uuid(),
        fromNodeId: faker.string.uuid(),
        toNodeId: faker.string.uuid(),
        fromOutput: "output",
        toInput: "input",
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      };

      // Act
      const result = WorkflowMapper.connectionToEntity(dbConnection);

      // Assert
      expect(result).toBeInstanceOf(WorkflowConnection);
      expect(result.id).toBe(dbConnection.id);
      expect(result.fromNodeId).toBe(dbConnection.fromNodeId);
      expect(result.toNodeId).toBe(dbConnection.toNodeId);
    });
  });

  describe("toPaginatedEntity", () => {
    it("Should map database workflows to paginated entity", () => {
      // Arrange
      const dbWorkflows = [
        {
          id: faker.string.uuid(),
          name: faker.word.words(3),
          userId: faker.string.uuid(),
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
        },
        {
          id: faker.string.uuid(),
          name: faker.word.words(3),
          userId: faker.string.uuid(),
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
        },
      ];
      const total = 10;

      // Act
      const result = WorkflowMapper.toPaginatedEntity(dbWorkflows, total);

      // Assert
      expect(result).toBeInstanceOf(WithPagination);
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(total);
      expect(result.items[0]).toBeInstanceOf(Workflow);
    });
  });
});

