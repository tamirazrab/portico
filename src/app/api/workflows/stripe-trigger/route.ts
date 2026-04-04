import "server-only";
import * as Sentry from "@sentry/nextjs";
import { type NextRequest, NextResponse } from "next/server";
import { logger } from "@/bootstrap/helpers/logging/logger";
import { workflowIdQuerySchema } from "@/bootstrap/helpers/security/webhook-schemas";
import { validateStripeWebhookPayload } from "@/bootstrap/helpers/security/webhook-validator";
import enqueueWorkflowExecutionUseCase from "@/feature/core/execution/application/usecase/enqueue-workflow-execution.usecase";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const validation = validateStripeWebhookPayload(rawBody, request);
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

    let body: {
      id?: string;
      type?: string;
      created?: number;
      livemode?: boolean;
      data?: { object?: unknown };
    };
    try {
      body = JSON.parse(rawBody) as typeof body;
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const stripeData = {
      eventId: body.id,
      eventType: body.type,
      timestamp: body.created,
      livemode: body.livemode,
      raw: body.data?.object,
    };

    const stripeEventId = body.id;
    if (!stripeEventId || typeof stripeEventId !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing Stripe event id" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const enqueue = await enqueueWorkflowExecutionUseCase({
      workflowId,
      trigger: { kind: "stripe", stripeEventId },
      initialData: {
        stripe: stripeData,
      },
    });
    if (!enqueue.ok) {
      logger.warn("Stripe webhook execution enqueue failed", {
        namespace: "stripe-webhook",
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

    logger.info("Stripe webhook processed successfully", {
      namespace: "stripe-webhook",
      metadata: { workflowId, eventType: stripeData.eventType },
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
    logger.error("Error processing Stripe trigger", {
      namespace: "stripe-webhook",
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });

    Sentry.captureException(error, {
      tags: {
        endpoint: "stripe-webhook",
      },
    });

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
