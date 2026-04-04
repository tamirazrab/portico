import { TRPCError } from "@trpc/server";
import { isLeft } from "fp-ts/lib/Either";
import z from "zod";
import { PAGINATION } from "@/config/constraints";
import getExecutionController from "@/server/controllers/executions/get-execution.controller";
import getExecutionsController from "@/server/controllers/executions/get-executions.controller";
import { mapFailureToTRPCError } from "../failure-to-trpc-error";
import { createTRPCRouter, protectedProcedure } from "../init";

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
        throw mapFailureToTRPCError(result.left);
      }

      return result.right;
    }),

  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
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
