import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/workflows/cron/route";

vi.mock(
  "@/feature/core/execution/application/usecase/enqueue-workflow-execution.usecase",
  () => ({
    default: vi.fn().mockResolvedValue({ ok: true }),
  }),
);

describe("cron webhook GET", () => {
  beforeEach(() => {
    vi.stubEnv("CRON_WEBHOOK_SECRET", "test-secret");
  });

  it("returns 401 when Authorization and query secret are wrong", async () => {
    const req = new NextRequest(
      "http://localhost/api/workflows/cron?workflowId=550e8400-e29b-41d4-a716-446655440000",
      { headers: { authorization: "Bearer wrong" } },
    );
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});
