import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import { PRISMA_CLIENT_KEY } from "@/feature/common/data/global.module";
import type { ApiEither } from "@/feature/common/data/api-task";
import { failureOr } from "@/feature/common/failures/failure-helpers";
import NetworkFailure from "@/feature/common/failures/network.failure";
import type WithPagination from "@/feature/common/class-helpers/with-pagination";
import featuresDi from "@/feature/common/features.di";
import type WorkflowRepository from "@/feature/core/workflow/domain/i-repo/workflow.repository.interface";
import type {
  CreateWorkflowParams,
  UpdateWorkflowParams,
  GetWorkflowsParams,
  GetWorkflowParams,
  WorkflowWithNodesAndConnections,
} from type "@/feature/core/workflow/domain/i-repo/workflow.repository.interface";
import Workflow from "@/feature/core/workflow/domain/entity/workflow.entity";
import WorkflowNotFoundFailure from "@/feature/core/workflow/domain/failure/workflow-not-found-failure";
import CreateWorkflowFailure from "@/feature/core/workflow/domain/failure/create-workflow-failure";
import NodeType from "@/feature/core/workflow/domain/enum/node-type.enum";
import { left, right } from "fp-ts/lib/Either";
import { generateSlug } from "random-word-slugs";
import { workflowModuleKey } from "../workflow-module-key";
import WorkflowMapper from "./workflow.mapper";

export default class WorkflowRepositoryImpl implements WorkflowRepository {
  private prisma: PrismaClient;

  constructor() {
    const di = featuresDi(workflowModuleKey);
    this.prisma = di.resolve<PrismaClient>(PRISMA_CLIENT_KEY);
  }

  async create(params: CreateWorkflowParams): Promise<ApiEither<Workflow>> {
    try {
      const dbWorkflow = await this.prisma.workflow.create({
        data: {
          name: params.name || generateSlug(3),
          userId: params.userId,
          nodes: {
            create: {
              name: NodeType.INITIAL,
              type: NodeType.INITIAL,
              position: { x: 0, y: 0 },
            },
          },
        },
      });
      return right(WorkflowMapper.toEntity(dbWorkflow));
    } catch (error) {
      return left(failureOr(error, new CreateWorkflowFailure({ reason: error })));
    }
  }

  async update(params: UpdateWorkflowParams): Promise<ApiEither<Workflow>> {
    try {
      // Verify workflow exists and belongs to user
      await this.prisma.workflow.findUniqueOrThrow({
        where: { id: params.id, userId: params.userId },
      });

      // Update in transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // Delete existing nodes and connections
        await tx.node.deleteMany({
          where: { workflowId: params.id },
        });

        // Create new nodes if provided
        if (params.nodes) {
          await tx.node.createMany({
            data: params.nodes.map((node) => ({
              id: node.id,
              workflowId: params.id,
              name: node.type || "unknown",
              type: (node.type as NodeType) || NodeType.INITIAL,
              position: node.position,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              data: (node.data || {}) as any,
            })),
          });
        }

        // Create new connections if provided
        if (params.edges) {
          await tx.connection.createMany({
            data: params.edges.map((edge) => ({
              workflowId: params.id,
              fromNodeId: edge.source,
              toNodeId: edge.target,
              fromOutput: edge.sourceHandle || "main",
              toInput: edge.targetHandle || "main",
            })),
          });
        }

        // Update workflow
        const updatedWorkflow = await tx.workflow.update({
          where: { id: params.id },
          data: {
            ...(params.name && { name: params.name }),
            updatedAt: new Date(),
          },
        });

        return updatedWorkflow;
      });

      return right(WorkflowMapper.toEntity(result));
    } catch (error) {
      return left(failureOr(error, new CreateWorkflowFailure({ reason: error })));
    }
  }

  async updateName(params: {
    id: string;
    userId: string;
    name: string;
  }): Promise<ApiEither<Workflow>> {
    try {
      const dbWorkflow = await this.prisma.workflow.update({
        where: {
          id: params.id,
          userId: params.userId,
        },
        data: {
          name: params.name,
        },
      });
      return right(WorkflowMapper.toEntity(dbWorkflow));
    } catch (error) {
      return left(failureOr(error, new CreateWorkflowFailure({ reason: error })));
    }
  }

  async delete(params: { id: string; userId: string }): Promise<ApiEither<true>> {
    try {
      await this.prisma.workflow.delete({
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

  async getOne(params: GetWorkflowParams): Promise<ApiEither<WorkflowWithNodesAndConnections>> {
    try {
      const dbWorkflow = await this.prisma.workflow.findUnique({
        where: {
          id: params.id,
          userId: params.userId,
        },
        include: {
          nodes: true,
          connections: true,
        },
      });

      if (!dbWorkflow) {
        return left(new WorkflowNotFoundFailure({ workflowId: params.id }));
      }

      return right({
        workflow: WorkflowMapper.toEntity(dbWorkflow),
        nodes: dbWorkflow.nodes.map((node) =>
          WorkflowMapper.nodeToEntity(node),
        ),
        connections: dbWorkflow.connections.map((conn) =>
          WorkflowMapper.connectionToEntity(conn),
        ),
      });
    } catch (error) {
      return left(
        error instanceof WorkflowNotFoundFailure
          ? error
          : failureOr(error, new NetworkFailure(error as Error)),
      );
    }
  }

  async getMany(params: GetWorkflowsParams): Promise<ApiEither<WithPagination<Workflow>>> {
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

      const [dbWorkflows, total] = await Promise.all([
        this.prisma.workflow.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: {
            createdAt: "desc",
          },
        }),
        this.prisma.workflow.count({ where }),
      ]);

      return right(WorkflowMapper.toPaginatedEntity(dbWorkflows, total));
    } catch (error) {
      return left(failureOr(error, new NetworkFailure(error as Error)));
    }
  }

  /**
   * Get workflow by ID only (for internal execution use in infrastructure layer).
   * This bypasses userId check and should only be used in trusted infrastructure contexts.
   */
  async getByIdForExecution(id: string): Promise<ApiEither<WorkflowWithNodesAndConnections>> {
    try {
      const dbWorkflow = await this.prisma.workflow.findUnique({
        where: {
          id,
        },
        include: {
          nodes: true,
          connections: true,
        },
      });

      if (!dbWorkflow) {
        return left(new WorkflowNotFoundFailure({ workflowId: id }));
      }

      return right({
        workflow: WorkflowMapper.toEntity(dbWorkflow),
        nodes: dbWorkflow.nodes.map((node) =>
          WorkflowMapper.nodeToEntity(node),
        ),
        connections: dbWorkflow.connections.map((conn) =>
          WorkflowMapper.connectionToEntity(conn),
        ),
      });
    } catch (error) {
      return left(
        error instanceof WorkflowNotFoundFailure
          ? error
          : failureOr(error, new NetworkFailure(error as Error)),
      );
    }
  }
}
