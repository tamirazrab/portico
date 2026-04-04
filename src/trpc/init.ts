import { initTRPC, TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import { cache } from "react";
import superjson from "superjson";
import { auth } from "@/bootstrap/boundaries/auth/better-auth";
import { getPolarCustomerStateCached } from "@/bootstrap/helpers/billing/polar-customer-state";

export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return {
    auth: session,
  };
});

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<typeof createTRPCContext>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const { createCallerFactory } = t;
export const baseProcedure = t.procedure;

export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  if (!ctx.auth) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  return next({
    ctx: {
      ...ctx,
      auth: ctx.auth,
    },
  });
});

type PremiumTRPCContext = Awaited<ReturnType<typeof createTRPCContext>> & {
  customer: Awaited<ReturnType<typeof getPolarCustomerStateCached>>;
};

export const premiumProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    if (!ctx.auth?.user?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to access this resource",
      });
    }

    const customer = await getPolarCustomerStateCached(ctx.auth.user.id);

    if (
      !customer.activeSubscriptions ||
      customer.activeSubscriptions.length === 0
    ) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You must be a premium user to access this resource",
      });
    }

    return next({
      ctx: {
        ...(ctx as PremiumTRPCContext),
        customer,
      },
    });
  },
);
