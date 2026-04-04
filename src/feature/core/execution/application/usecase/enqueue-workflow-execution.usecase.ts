import "server-only";
import { assertWorkflowAllowsWebhookTrigger } from "@/bootstrap/helpers/security/workflow-webhook-trigger";
import {
  type SendWorkflowExecutionParams,
  sendWorkflowExecution,
} from "@/bootstrap/integrations/inngest/util";

export type EnqueueTrigger =
  | { kind: "cron" }
  | { kind: "stripe"; stripeEventId: string }
  | {
      kind: "google_form";
      formId?: string;
      responseId?: string;
      timestamp?: string | number;
    }
  | { kind: "manual" };

export type EnqueueWorkflowExecutionParams = {
  workflowId: string;
  trigger: EnqueueTrigger;
  initialData?: Record<string, unknown>;
};

export type EnqueueWorkflowExecutionResult =
  | { ok: true }
  | { ok: false; status: 400 | 403 | 404; message: string };

function computeIdempotencyKey(
  workflowId: string,
  trigger: EnqueueTrigger,
): string | undefined {
  switch (trigger.kind) {
    case "stripe":
      return `stripe:${trigger.stripeEventId}`;
    case "cron": {
      const minuteUtc = new Date().toISOString().slice(0, 16);
      return `cron:${workflowId}:${minuteUtc}`;
    }
    case "google_form": {
      const parts = [
        trigger.formId,
        trigger.responseId,
        trigger.timestamp !== undefined ? String(trigger.timestamp) : "",
      ].filter((p): p is string => typeof p === "string" && p.length > 0);
      return parts.length > 0
        ? `google-form:${workflowId}:${parts.join(":")}`
        : undefined;
    }
    case "manual":
      return undefined;
  }
}

export default async function enqueueWorkflowExecutionUseCase(
  params: EnqueueWorkflowExecutionParams,
): Promise<EnqueueWorkflowExecutionResult> {
  // Enforce trigger ↔ workflow binding for webhook triggers.
  if (
    params.trigger.kind === "cron" ||
    params.trigger.kind === "stripe" ||
    params.trigger.kind === "google_form"
  ) {
    const wfCheck = await assertWorkflowAllowsWebhookTrigger(
      params.workflowId,
      params.trigger.kind,
    );
    if (!wfCheck.ok) {
      return { ok: false, status: wfCheck.status, message: wfCheck.message };
    }
  }

  const sendParams: SendWorkflowExecutionParams = {
    workflowId: params.workflowId,
    ...(params.initialData !== undefined
      ? { initialData: params.initialData }
      : {}),
    idempotencyKey: computeIdempotencyKey(params.workflowId, params.trigger),
  };

  await sendWorkflowExecution(sendParams);
  return { ok: true };
}
