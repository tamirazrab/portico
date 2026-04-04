import "server-only";
import { isLeft } from "fp-ts/lib/Either";
import NodeType from "@/feature/core/workflow/domain/enum/node-type.enum";
import getWorkflowByIdForExecutionUseCase from "@/feature/core/workflow/domain/usecase/get-workflow-by-id-for-execution.usecase";

export type WebhookTriggerChannel = "cron" | "stripe" | "google_form";

const TRIGGER_BY_CHANNEL: Record<WebhookTriggerChannel, readonly NodeType[]> = {
  cron: [NodeType.CRON],
  stripe: [NodeType.STRIPE_TRIGGER],
  google_form: [NodeType.GOOGLE_FORM_TRIGGER],
};

export async function assertWorkflowAllowsWebhookTrigger(
  workflowId: string,
  channel: WebhookTriggerChannel,
): Promise<{ ok: true } | { ok: false; status: 404 | 403; message: string }> {
  const result = await getWorkflowByIdForExecutionUseCase(workflowId);
  if (isLeft(result)) {
    return { ok: false, status: 404, message: "Workflow not found" };
  }

  const requiredTypes = TRIGGER_BY_CHANNEL[channel];
  const hasTrigger = result.right.nodes.some((node) =>
    requiredTypes.includes(node.type),
  );

  if (!hasTrigger) {
    return {
      ok: false,
      status: 403,
      message: "Workflow is not configured for this trigger type",
    };
  }

  return { ok: true };
}
