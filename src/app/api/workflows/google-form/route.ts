import "server-only";
import { sendWorkflowExecution } from "@/bootstrap/integrations/inngest/util";
import { validateGoogleWebhook } from "@/bootstrap/helpers/security/webhook-validator";
import { logger } from "@/bootstrap/helpers/logging/logger";
import { type NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

/**
 * Google Forms webhook endpoint.
 * Security: Basic validation only. For production, add:
 * - Google signature validation (implement validateGoogleWebhook)
 * - IP whitelisting
 * - Rate limiting
 */
export async function POST(request: NextRequest) {
  try {
    // Validate webhook request
    const validation = await validateGoogleWebhook(request);
    if (!validation.isValid) {
      logger.warn("Google Form webhook validation failed", {
        namespace: "google-form-webhook",
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

    const formData = {
      formId: body.formId,
      formTitle: body.formTitle,
      responseId: body.responseId,
      timestamp: body.timestamp,
      respondentEmail: body.respondentEmail,
      responses: body.responses,
      raw: body,
    };

    await sendWorkflowExecution({
      workflowId,
      initialData: {
        googleForm: formData,
      },
    });

    logger.info("Google Form webhook processed successfully", {
      namespace: "google-form-webhook",
      metadata: { workflowId, formId: formData.formId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error("Error processing Google Form trigger", {
      namespace: "google-form-webhook",
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });

    Sentry.captureException(error, {
      tags: {
        endpoint: "google-form-webhook",
      },
    });

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
