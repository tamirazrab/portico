import "server-only";
import { PrismaClient } from "@/generated/prisma/client";
import { PRISMA_CLIENT_KEY } from "@/feature/common/data/global.module";
import ApiTask from "@/feature/common/data/api-task";
import { failureOr } from "@/feature/common/failures/failure-helpers";
import NetworkFailure from "@/feature/common/failures/network.failure";
import WithPagination from "@/feature/common/class-helpers/with-pagination";
import featuresDi from "@/feature/common/features.di";
import WorkflowRepository, {
  CreateWorkflowParams,
  UpdateWorkflowParams,
  GetWorkflowsParams,
  GetWorkflowParams,
  WorkflowWithNodesAndConnections,
} from "@/feature/core/workflow/domain/i-repo/workflow.repository.interface";
import Workflow from "@/feature/core/workflow/domain/entity/workflow.entity";
import WorkflowNotFoundFailure from "@/feature/core/workflow/domain/failure/workflow-not-found-failure";
import CreateWorkflowFailure from "@/feature/core/workflow/domain/failure/create-workflow-failure";
import NodeType from "@/feature/core/workflow/domain/enum/node-type.enum";
import { pipe } from "fp-ts/lib/function";
import { tryCatch, map, chain } from "fp-ts/lib/TaskEither";
import { generateSlug } from "random-word-slugs";
import { workflowModuleKey } from "../workflow-module-key";
import WorkflowMapper from "./workflow.mapper";

export default class WorkflowRepositoryImpl implements WorkflowRepository {
  private prisma: PrismaClient;

  constructor() {
    const di = featuresDi(workflowModuleKey);
    this.prisma = di.resolve<PrismaClient>(PRISMA_CLIENT_KEY);
  }

  create(params: CreateWorkflowParams): ApiTask<Workflow> {
    return pipe(
      tryCatch(
        async () => {
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
          return WorkflowMapper.toEntity(dbWorkflow);
        },
        (error) =>
          failureOr(error, new CreateWorkflowFailure({ reason: error })),
      ),
    );
  }

  update(params: UpdateWorkflowParams): ApiTask<Workflow> {
    return pipe(
      tryCatch(
        async () => {
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
                  data: node.data || {},
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

          return WorkflowMapper.toEntity(result);
        },
        (error) =>
          failureOr(error, new CreateWorkflowFailure({ reason: error })),
      ),
    );
  }

  updateName(params: {
    id: string;
    userId: string;
    name: string;
  }): ApiTask<Workflow> {
    return pipe(
      tryCatch(
        async () => {
          const dbWorkflow = await this.prisma.workflow.update({
            where: {
              id: params.id,
              userId: params.userId,
            },
            data: {
              name: params.name,
            },
          });
          return WorkflowMapper.toEntity(dbWorkflow);
        },
        (error) =>
          failureOr(error, new CreateWorkflowFailure({ reason: error })),
      ),
    );
  }

  delete(params: { id: string; userId: string }): ApiTask<true> {
    return pipe(
      tryCatch(
        async () => {
          await this.prisma.workflow.delete({
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

  getOne(params: GetWorkflowParams): ApiTask<WorkflowWithNodesAndConnections> {
    return pipe(
      tryCatch(
        async () => {
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
            throw new WorkflowNotFoundFailure({ workflowId: params.id });
          }

          return {
            workflow: WorkflowMapper.toEntity(dbWorkflow),
            nodes: dbWorkflow.nodes.map((node) =>
              WorkflowMapper.nodeToEntity(node),
            ),
            connections: dbWorkflow.connections.map((conn) =>
              WorkflowMapper.connectionToEntity(conn),
            ),
          };
        },
        (error) =>
          error instanceof WorkflowNotFoundFailure
            ? error
            : failureOr(error, new NetworkFailure(error as Error)),
      ),
    );
  }

  getMany(params: GetWorkflowsParams): ApiTask<WithPagination<Workflow>> {
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

          return WorkflowMapper.toPaginatedEntity(dbWorkflows, total);
        },
        (error) => failureOr(error, new NetworkFailure(error as Error)),
      ),
    );
  }
}
