"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/bootstrap/integrations/inngest/client";
import { cronTriggerChannel } from "@/bootstrap/integrations/inngest/channels/cron";

export type CronTriggerStatus = Realtime.Token<typeof cronTriggerChannel, ["status"]>;

export async function fetchCronTriggerRealtimeToken(): Promise<CronTriggerStatus> {
  const token = await getSubscriptionToken(inngest, {
    channel: cronTriggerChannel(),
    topics: ["status"],
  });

  return token;
}
