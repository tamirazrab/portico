import { left, right } from "fp-ts/lib/Either";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { assertWorkflowAllowsWebhookTrigger } from "@/bootstrap/helpers/security/workflow-webhook-trigger";
import NodeType from "@/feature/core/workflow/domain/enum/node-type.enum";
import WorkflowNotFoundFailure from "@/feature/core/workflow/domain/failure/workflow-not-found-failure";

const mockGetWorkflow = vi.fn();
vi.mock(
  "@/feature/core/workflow/domain/usecase/get-workflow-by-id-for-execution.usecase",
  () => ({
    default: (...args: unknown[]) => mockGetWorkflow(...args),
  }),
);

describe("assertWorkflowAllowsWebhookTrigger", () => {
  beforeEach(() => {
    mockGetWorkflow.mockReset();
  });

  it("returns 404 when workflow missing", async () => {
    mockGetWorkflow.mockResolvedValue(
      left(new WorkflowNotFoundFailure({ workflowId: "wid" })),
    );
    const r = await assertWorkflowAllowsWebhookTrigger("wid", "cron");
    expect(r).toEqual({
      ok: false,
      status: 404,
      message: "Workflow not found",
    });
  });

  it("returns 403 when cron channel but no CRON node", async () => {
    mockGetWorkflow.mockResolvedValue(
      right({
        workflow: {} as never,
        nodes: [
          {
            type: NodeType.MANUAL_TRIGGER,
          },
        ],
        connections: [],
      }),
    );
    const r = await assertWorkflowAllowsWebhookTrigger("wid", "cron");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(403);
  });

  it("returns ok when CRON node present for cron channel", async () => {
    mockGetWorkflow.mockResolvedValue(
      right({
        workflow: {} as never,
        nodes: [{ type: NodeType.CRON }],
        connections: [],
      }),
    );
    const r = await assertWorkflowAllowsWebhookTrigger("wid", "cron");
    expect(r).toEqual({ ok: true });
  });
});
