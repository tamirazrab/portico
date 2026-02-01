import "server-only";
import { sendWorkflowExecution } from "@/bootstrap/integrations/inngest/util";
import { validateWebhookRequest } from "@/bootstrap/helpers/security/webhook-validator";
import { logger } from "@/bootstrap/helpers/logging/logger";
import { type NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

/**
 * Cron webhook endpoint.
 * Security: Basic validation only. For production, add:
 * - Authentication token validation
 * - IP whitelisting
 * - Rate limiting
 */
export async function GET(request: NextRequest) {
  try {
    // Validate webhook request
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
        { status: 400 },
      );
    }

    const url = new URL(request.url);
    const workflowId = url.searchParams.get("workflowId");

    if (!workflowId) {
      return NextResponse.json(
        { success: false, error: "Missing workflowId" },
        { status: 400 },
      );
    }

    await sendWorkflowExecution({
      workflowId,
    });

    logger.info("Cron webhook processed successfully", {
      namespace: "cron-webhook",
      metadata: { workflowId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error("Error processing cron trigger", {
      namespace: "cron-webhook",
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });

    Sentry.captureException(error, {
      tags: {
        endpoint: "cron-webhook",
      },
    });

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
