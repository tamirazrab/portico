import "server-only";
import * as Sentry from "@sentry/nextjs";
import { type NextRequest, NextResponse } from "next/server";
import { logger } from "@/bootstrap/helpers/logging/logger";
import { googleFormWebhookBodySchema } from "@/bootstrap/helpers/security/google-form-webhook-schema";
import { workflowIdQuerySchema } from "@/bootstrap/helpers/security/webhook-schemas";
import { validateGoogleFormWebhookAuth } from "@/bootstrap/helpers/security/webhook-validator";
import enqueueWorkflowExecutionUseCase from "@/feature/core/execution/application/usecase/enqueue-workflow-execution.usecase";

export async function POST(request: NextRequest) {
  try {
    const auth = validateGoogleFormWebhookAuth(request);
    if (!auth.isValid) {
      logger.warn("Google Form webhook auth failed", {
        namespace: "google-form-webhook",
        metadata: { error: auth.error, url: request.url },
      });
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401, headers: { "Cache-Control": "no-store" } },
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

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const parsed = googleFormWebhookBodySchema.safeParse(json);
    if (!parsed.success) {
      logger.warn("Google Form webhook body validation failed", {
        namespace: "google-form-webhook",
        metadata: { issues: parsed.error.flatten() },
      });
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const body = parsed.data;

    const formData = {
      formId: body.formId,
      formTitle: body.formTitle,
      responseId: body.responseId,
      timestamp: body.timestamp,
      respondentEmail: body.respondentEmail,
      responses: body.responses,
      raw: body,
    };

    const enqueue = await enqueueWorkflowExecutionUseCase({
      workflowId,
      trigger: {
        kind: "google_form",
        formId: body.formId,
        responseId: body.responseId,
        timestamp: body.timestamp,
      },
      initialData: {
        googleForm: formData,
      },
    });
    if (!enqueue.ok) {
      logger.warn("Google Form webhook execution enqueue failed", {
        namespace: "google-form-webhook",
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

    logger.info("Google Form webhook processed successfully", {
      namespace: "google-form-webhook",
      metadata: { workflowId, formId: formData.formId },
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
    logger.error("Error processing Google Form trigger", {
      namespace: "google-form-webhook",
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });

    Sentry.captureException(error, {
      tags: {
        endpoint: "google-form-webhook",
      },
    });

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
