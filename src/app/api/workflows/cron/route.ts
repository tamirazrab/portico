import "server-only";
import * as Sentry from "@sentry/nextjs";
import { type NextRequest, NextResponse } from "next/server";
import { logger } from "@/bootstrap/helpers/logging/logger";
import { workflowIdQuerySchema } from "@/bootstrap/helpers/security/webhook-schemas";
import {
  validateCronBearer,
  validateWebhookRequest,
} from "@/bootstrap/helpers/security/webhook-validator";
import enqueueWorkflowExecutionUseCase from "@/feature/core/execution/application/usecase/enqueue-workflow-execution.usecase";

/**
 * Cron webhook endpoint. Requires Authorization: Bearer CRON_WEBHOOK_SECRET.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = validateCronBearer(request);
    if (!auth.isValid) {
      logger.warn("Cron webhook auth failed", {
        namespace: "cron-webhook",
        metadata: { error: auth.error, url: request.url },
      });
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }

    const validation = validateWebhookRequest(request, ["workflowId"]);
    if (!validation.isValid) {
      logger.warn("Cron webhook validation failed", {
        namespace: "cron-webhook",
        metadata: {
          error: validation.error,
          url: request.url,
        },
      });
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const url = new URL(request.url);
    const parsedQuery = workflowIdQuerySchema.safeParse(
      Object.fromEntries(url.searchParams.entries()),
    );
    if (!parsedQuery.success) {
      return NextResponse.json(
        { success: false, error: "Invalid workflowId" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }
    const { workflowId } = parsedQuery.data;

    const enqueue = await enqueueWorkflowExecutionUseCase({
      workflowId,
      trigger: { kind: "cron" },
    });
    if (!enqueue.ok) {
      logger.warn("Cron webhook execution enqueue failed", {
        namespace: "cron-webhook",
        metadata: {
          workflowId,
          status: enqueue.status,
          message: enqueue.message,
        },
      });
      return NextResponse.json(
        { success: false, error: enqueue.message },
        { status: enqueue.status, headers: { "Cache-Control": "no-store" } },
      );
    }

    logger.info("Cron webhook processed successfully", {
      namespace: "cron-webhook",
      metadata: { workflowId },
    });

    return NextResponse.json(
      { success: true },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    logger.error("Error processing cron trigger", {
      namespace: "cron-webhook",
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });

    Sentry.captureException(error, {
      tags: {
        endpoint: "cron-webhook",
      },
    });

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
