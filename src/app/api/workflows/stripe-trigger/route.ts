import "server-only";
import { sendWorkflowExecution } from "@/bootstrap/integrations/inngest/util";
import { validateStripeWebhook } from "@/bootstrap/helpers/security/webhook-validator";
import { logger } from "@/bootstrap/helpers/logging/logger";
import { type NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

/**
 * Stripe webhook endpoint.
 * Security: Basic validation only. For production, add:
 * - Stripe signature validation (implement validateStripeWebhook)
 * - IP whitelisting (Stripe IPs)
 * - Rate limiting
 */
export async function POST(request: NextRequest) {
  try {
    // Validate Stripe webhook signature
    const validation = await validateStripeWebhook(request);
    if (!validation.isValid) {
      logger.warn("Stripe webhook validation failed", {
        namespace: "stripe-webhook",
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

    const body = await request.json();

    const stripeData = {
      eventId: body.Id,
      eventType: body.type,
      timestamp: body.created,
      livemode: body.livemode,
      raw: body.data?.object,
    };

    await sendWorkflowExecution({
      workflowId,
      initialData: {
        stripe: stripeData,
      },
    });

    logger.info("Stripe webhook processed successfully", {
      namespace: "stripe-webhook",
      metadata: { workflowId, eventType: stripeData.eventType },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error("Error processing Stripe trigger", {
      namespace: "stripe-webhook",
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });

    Sentry.captureException(error, {
      tags: {
        endpoint: "stripe-webhook",
      },
    });

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
