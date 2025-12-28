"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/bootstrap/integrations/inngest/client";
import { manualTriggerChannel } from "@/bootstrap/integrations/inngest/channels/manual-trigger";

export type ManualTriggerStatus = Realtime.Token<
  typeof manualTriggerChannel,
  ["status"]
>;

export async function fetchManualTriggerRealtimeToken(): Promise<ManualTriggerStatus> {
  const token = await getSubscriptionToken(inngest, {
    channel: manualTriggerChannel(),
    topics: ["status"],
  });

  return token;
}
