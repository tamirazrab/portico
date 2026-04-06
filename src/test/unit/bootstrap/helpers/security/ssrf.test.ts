import { describe, expect, it } from "vitest";
import { validateOutboundUrl } from "@/bootstrap/helpers/security/ssrf";

describe("validateOutboundUrl", () => {
  it("rejects localhost hostnames", async () => {
    const r = await validateOutboundUrl("http://localhost:8080/x");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/localhost/i);
  });

  it("rejects loopback IPv4", async () => {
    const r = await validateOutboundUrl("http://127.0.0.1/api");
    expect(r.ok).toBe(false);
  });

  it("rejects private IPv4", async () => {
    const r = await validateOutboundUrl("http://10.0.0.1/");
    expect(r.ok).toBe(false);
  });

  it("rejects non-http schemes", async () => {
    const r = await validateOutboundUrl("file:///etc/passwd");
    expect(r.ok).toBe(false);
  });

  it("accepts literal public IPv4 without DNS lookup", async () => {
    const r = await validateOutboundUrl("https://8.8.8.8/");
    expect(r.ok).toBe(true);
  });
});
