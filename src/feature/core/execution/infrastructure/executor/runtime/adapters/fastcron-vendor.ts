import "server-only";
import type { CronEntry, CronVendorPort } from "../ports/cron-vendor.port";

function ensureOk(res: Response, message: string) {
  if (!res.ok) {
    throw new Error(`${message}: ${res.status} ${res.statusText}`);
  }
}

export class FastCronVendor implements CronVendorPort {
  async list(token: string): Promise<CronEntry[]> {
    const url = `https://app.fastcron.com/api/v1/cron_list?token=${token}`;
    const res = await fetch(url);
    ensureOk(res, "Failed to fetch cron list");
    const json = (await res.json()) as unknown;
    const root = json as { data?: unknown };
    const entries = Array.isArray(root?.data) ? root.data : [];
    return entries
      .filter((e): e is { id: string; name: string } => {
        if (!e || typeof e !== "object") return false;
        const obj = e as Record<string, unknown>;
        return typeof obj.id === "string" && typeof obj.name === "string";
      })
      .map((e) => ({ id: e.id, name: e.name }));
  }

  async update(params: {
    token: string;
    id: string;
    expression: string;
    timezone?: string;
  }): Promise<void> {
    const tz = params.timezone
      ? `&timezone=${encodeURIComponent(params.timezone)}`
      : "";
    const url = `https://app.fastcron.com/api/v1/cron_edit?token=${encodeURIComponent(
      params.token,
    )}&id=${encodeURIComponent(params.id)}&expression=${encodeURIComponent(
      params.expression,
    )}${tz}`;
    const res = await fetch(url, { method: "POST" });
    ensureOk(res, "Failed to update cron job");
  }

  async create(params: {
    token: string;
    timezone: string;
    name: string;
    expression: string;
    url: string;
  }): Promise<void> {
    const url = `https://app.fastcron.com/api/v1/cron_add?token=${encodeURIComponent(
      params.token,
    )}&timezone=${encodeURIComponent(params.timezone)}&name=${encodeURIComponent(
      params.name,
    )}&expression=${encodeURIComponent(params.expression)}&url=${encodeURIComponent(params.url)}`;
    const res = await fetch(url, { method: "POST" });
    ensureOk(res, "Failed to create cron job");
  }

  async remove(params: { token: string; id: string }): Promise<void> {
    const url = `https://app.fastcron.com/api/v1/cron_delete?token=${encodeURIComponent(
      params.token,
    )}&id=${encodeURIComponent(params.id)}`;
    const res = await fetch(url, { method: "POST" });
    ensureOk(res, "Failed to delete cron job");
  }
}
