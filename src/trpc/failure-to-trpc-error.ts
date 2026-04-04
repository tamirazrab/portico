import { TRPCError } from "@trpc/server";
import type BaseFailure from "@/feature/common/failures/base.failure";

export function mapFailureToTRPCError(
  failure: BaseFailure<unknown>,
): TRPCError {
  const key = `${failure.namespace}:${failure.message}`;

  // Best-effort mapping based on existing failure keys.
  if (key.includes("workflow:workflow-not-found")) {
    return new TRPCError({ code: "NOT_FOUND", message: "Workflow not found" });
  }

  if (key.includes("workflow:premium-required")) {
    return new TRPCError({
      code: "FORBIDDEN",
      message: "You must be a premium user to run this workflow",
    });
  }

  // Param/arguments failures are treated as bad requests.
  if (failure.message === "params" || failure.message === "arguments") {
    return new TRPCError({ code: "BAD_REQUEST", message: "Invalid request" });
  }

  if (failure.message === "unauthorized" || failure.message === "auth-token") {
    return new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
  }

  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
  });
}
