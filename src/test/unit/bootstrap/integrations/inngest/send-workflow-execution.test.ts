import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { sendWorkflowExecution } from "@/bootstrap/integrations/inngest/util";

const mockSend = vi.fn().mockResolvedValue({ ids: ["e1"] });

vi.mock("@/bootstrap/integrations/inngest/client", () => ({
  inngest: {
    send: (...args: unknown[]) => mockSend(...args),
  },
}));

describe("sendWorkflowExecution", () => {
  beforeEach(() => {
    mockSend.mockClear();
  });

  it("passes idempotencyKey through as Inngest event id", async () => {
    await sendWorkflowExecution({
      workflowId: "w1",
      idempotencyKey: "stripe:evt_123",
      initialData: { x: 1 },
    });
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "stripe:evt_123",
        name: "workflows/execute.workflow",
        data: expect.objectContaining({
          workflowId: "w1",
          initialData: { x: 1 },
        }),
      }),
    );
  });

  it("omits initialData when undefined", async () => {
    await sendWorkflowExecution({ workflowId: "w2" });
    const arg = mockSend.mock.calls[0]?.[0] as {
      data: Record<string, unknown>;
      id: string;
    };
    expect(arg.data).toEqual({ workflowId: "w2" });
    expect(typeof arg.id).toBe("string");
    expect(arg.id.length).toBeGreaterThan(0);
  });
});
