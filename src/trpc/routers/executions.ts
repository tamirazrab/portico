import { createTRPCRouter, protectedProcedure } from "../init";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { PAGINATION } from "@/config/constraints";
import getExecutionsController from "@/app/[lang]/dashboard/executions/controller/get-executions.controller";
import getExecutionController from "@/app/[lang]/dashboard/executions/controller/get-execution.controller";
import { isLeft } from "fp-ts/lib/Either";

export const executionsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.auth?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in",
        });
      }

      const result = await getExecutionController({
        id: input.id,
        userId: ctx.auth.user.id,
      });

      if (isLeft(result)) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Execution not found",
        });
      }

      return result.right;
    }),

  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(PAGINATION.DEFAULT_PAGE),
        pageSize: z.number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.auth?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in",
        });
      }

      const result = await getExecutionsController({
        userId: ctx.auth.user.id,
        page: input.page,
        pageSize: input.pageSize,
      });

      if (isLeft(result)) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch executions",
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

