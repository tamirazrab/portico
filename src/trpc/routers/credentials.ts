import { TRPCError } from "@trpc/server";
import z from "zod";
import { PAGINATION } from "@/config/constraints";
import createCredentialController from "@/app/[lang]/dashboard/credentials/controller/create-credential.controller";
import getCredentialsController from "@/app/[lang]/dashboard/credentials/controller/get-credentials.controller";
import updateCredentialController from "@/app/[lang]/dashboard/credentials/controller/update-credential.controller";
import deleteCredentialController from "@/app/[lang]/dashboard/credentials/controller/delete-credential.controller";
import getCredentialController from "@/app/[lang]/dashboard/credentials/controller/get-credential.controller";
import getCredentialsByTypeController from "@/app/[lang]/dashboard/credentials/controller/get-credentials-by-type.controller";
import { isLeft } from "fp-ts/lib/Either";
import CredentialType from "@/feature/core/credential/domain/enum/credential-type.enum";
import {
  createTRPCRouter,
  protectedProcedure,
  premiumProcedure,
} from "../init";

const CredentialTypeEnum = z.enum([
  CredentialType.GEMINI,
  CredentialType.ANTHROPIC,
  CredentialType.OPENAI,
  CredentialType.CRON,
]);

export const credentialsRouter = createTRPCRouter({
  create: premiumProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        value: z.string().min(1, "Value is required"),
        type: CredentialTypeEnum,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.auth?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in",
        });
      }

      const result = await createCredentialController({
        ...input,
        userId: ctx.auth.user.id,
      });

      if (isLeft(result)) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create credential",
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

      const result = await deleteCredentialController({
        id: input.id,
        userId: ctx.auth.user.id,
      });

      if (isLeft(result)) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete credential",
        });
      }

      return { success: true };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required"),
        value: z.string().min(1, "Value is required"),
        type: CredentialTypeEnum,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.auth?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in",
        });
      }

      const result = await updateCredentialController({
        ...input,
        userId: ctx.auth.user.id,
      });

      if (isLeft(result)) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update credential",
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

      const result = await getCredentialController({
        id: input.id,
        userId: ctx.auth.user.id,
      });

      if (isLeft(result)) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Credential not found",
        });
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

      const result = await getCredentialsController({
        userId: ctx.auth.user.id,
        page: input.page,
        pageSize: input.pageSize,
        search: input.search,
      });

      if (isLeft(result)) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch credentials",
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

  getByType: protectedProcedure
    .input(z.object({ type: CredentialTypeEnum }))
    .query(async ({ ctx, input }) => {
      if (!ctx.auth?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in",
        });
      }

      const result = await getCredentialsByTypeController({
        userId: ctx.auth.user.id,
        type: input.type,
      });

      if (isLeft(result)) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch credentials",
        });
      }

      return result.right;
    }),
});
