import { createTRPCRouter, protectedProcedure, premiumProcedure } from "../init";
import { TRPCError } from "@trpc/server";
import z from "zod";
import createWorkflowController from "@/app/[lang]/dashboard/workflows/controller/create-workflow.controller";
import getWorkflowsController from "@/app/[lang]/dashboard/workflows/controller/get-workflows.controller";
import getWorkflowController from "@/app/[lang]/dashboard/workflows/controller/get-workflow.controller";
import updateWorkflowController from "@/app/[lang]/dashboard/workflows/controller/update-workflow.controller";
import updateWorkflowNameController from "@/app/[lang]/dashboard/workflows/controller/update-workflow-name.controller";
import deleteWorkflowController from "@/app/[lang]/dashboard/workflows/controller/delete-workflow.controller";
import executeWorkflowController from "@/app/[lang]/dashboard/workflows/controller/execute-workflow.controller";
import { isLeft } from "fp-ts/lib/Either";

export const workflowsRouter = createTRPCRouter({
  execute: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.auth?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in",
        });
      }

      const result = await executeWorkflowController({
        id: input.id,
        userId: ctx.auth.user.id,
      });

      if (isLeft(result)) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to execute workflow",
        });
      }

      return result.right;
    }),

  create: premiumProcedure.mutation(async ({ ctx }) => {
    if (!ctx.auth?.user?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in",
      });
    }

    const result = await createWorkflowController({
      name: "",
      userId: ctx.auth.user.id,
    });

    if (isLeft(result)) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create workflow",
      });
    }

    return result.right;
  }),

  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.auth?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in",
        });
      }

      const result = await deleteWorkflowController({
        id: input.id,
        userId: ctx.auth.user.id,
      });

      if (isLeft(result)) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete workflow",
        });
      }

      return { success: true };
    }),

  updateName: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.auth?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in",
        });
      }

      const result = await updateWorkflowNameController({
        id: input.id,
        userId: ctx.auth.user.id,
        name: input.name,
      });

      if (isLeft(result)) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update workflow name",
        });
      }

      return result.right;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        nodes: z.array(
          z.object({
            id: z.string(),
            type: z.string().nullish(),
            position: z.object({ x: z.number(), y: z.number() }),
            data: z.record(z.string(), z.any()).optional(),
          }),
        ),
        edges: z.array(
          z.object({
            source: z.string(),
            target: z.string(),
            sourceHandle: z.string().nullish(),
            targetHandle: z.string().nullish(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.auth?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in",
        });
      }

      const result = await updateWorkflowController({
        id: input.id,
        userId: ctx.auth.user.id,
        nodes: input.nodes,
        edges: input.edges,
      });

      if (isLeft(result)) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update workflow",
        });
      }

      return result.right;
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.auth?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in",
        });
      }

      const result = await getWorkflowController({
        id: input.id,
        userId: ctx.auth.user.id,
      });

      if (isLeft(result)) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workflow not found",
        });
      }

      // Transform to React Flow format
      const { workflow, nodes, connections } = result.right;
      return {
        id: workflow.id,
        name: workflow.name,
        nodes: nodes.map((node) => ({
          id: node.id,
          type: node.type,
          position: node.position,
          data: node.data,
        })),
        edges: connections.map((conn) => ({
          id: conn.id,
          source: conn.fromNodeId,
          target: conn.toNodeId,
          sourceHandle: conn.fromOutput,
          targetHandle: conn.toInput,
        })),
      };
    }),

  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        pageSize: z.number().min(1).max(100).default(10),
        search: z.string().default(""),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.auth?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in",
        });
      }

      const result = await getWorkflowsController({
        userId: ctx.auth.user.id,
        page: input.page,
        pageSize: input.pageSize,
        search: input.search,
      });

      if (isLeft(result)) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch workflows",
        });
      }

      const { items, total } = result.right;
      const totalPages = Math.ceil(total / input.pageSize);
      const hasNextPage = input.page < totalPages;
      const hasPreviousPage = input.page > 1;

      return {
        items,
        page: input.page,
        pageSize: input.pageSize,
        totalCount: total,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      };
    }),
});

