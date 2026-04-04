import { TRPCError } from "@trpc/server";
import { isLeft } from "fp-ts/lib/Either";
import z from "zod";
import { userHasActivePolarSubscription } from "@/bootstrap/helpers/billing/polar-customer-state";
import NodeType from "@/feature/core/workflow/domain/enum/node-type.enum";
import createWorkflowController from "@/server/controllers/workflows/create-workflow.controller";
import deleteWorkflowController from "@/server/controllers/workflows/delete-workflow.controller";
import executeWorkflowController from "@/server/controllers/workflows/execute-workflow.controller";
import getWorkflowController from "@/server/controllers/workflows/get-workflow.controller";
import getWorkflowsController from "@/server/controllers/workflows/get-workflows.controller";
import updateWorkflowController from "@/server/controllers/workflows/update-workflow.controller";
import updateWorkflowNameController from "@/server/controllers/workflows/update-workflow-name.controller";
import { mapFailureToTRPCError } from "../failure-to-trpc-error";
import {
  createTRPCRouter,
  premiumProcedure,
  protectedProcedure,
} from "../init";

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
        throw mapFailureToTRPCError(result.left);
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
      throw mapFailureToTRPCError(result.left);
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
        throw mapFailureToTRPCError(result.left);
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
        throw mapFailureToTRPCError(result.left);
      }

      return result.right;
    }),

  update: protectedProcedure
    .input(
      z
        .object({
          id: z.string().uuid(),
          nodes: z
            .array(
              z.object({
                id: z.string(),
                type: z.nativeEnum(NodeType).nullish(),
                position: z.object({ x: z.number(), y: z.number() }),
                data: z.record(z.string(), z.unknown()).optional(),
              }),
            )
            .max(300),
          edges: z
            .array(
              z.object({
                source: z.string(),
                target: z.string(),
                sourceHandle: z.string().nullish(),
                targetHandle: z.string().nullish(),
              }),
            )
            .max(600),
        })
        .superRefine((val, ctx) => {
          const nodesJson = JSON.stringify(val.nodes).length;
          const edgesJson = JSON.stringify(val.edges).length;
          const max = 1_500_000;
          if (nodesJson + edgesJson > max) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Workflow graph payload is too large",
            });
          }
        }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.auth?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in",
        });
      }

      // Minimal server-side premium gating: prevent non-premium users from saving premium nodes.
      // PremiumProcedure is only used for create; update must also be guarded.
      const hasPremiumNodes = input.nodes.some((n) =>
        [
          NodeType.OPENAI,
          NodeType.ANTHROPIC,
          NodeType.GEMINI,
          NodeType.DISCORD,
          NodeType.SLACK,
        ].includes((n.type ?? NodeType.INITIAL) as NodeType),
      );
      if (hasPremiumNodes) {
        const entitled = await userHasActivePolarSubscription(ctx.auth.user.id);
        if (!entitled) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You must be a premium user to use these nodes",
          });
        }
      }

      const result = await updateWorkflowController({
        id: input.id,
        userId: ctx.auth.user.id,
        nodes: input.nodes,
        edges: input.edges,
      });

      if (isLeft(result)) {
        throw mapFailureToTRPCError(result.left);
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
        throw mapFailureToTRPCError(result.left);
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
        throw mapFailureToTRPCError(result.left);
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
