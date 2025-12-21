"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { SlackChannel } from "@/bootstrap/integrations/inngest/channels/slack";
import { inngest } from "@/bootstrap/integrations/inngest/client";

export type SlackToken = Realtime.Token<typeof SlackChannel, ["status"]>;

export async function fetchSlackRealtimeToken(): Promise<SlackToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: SlackChannel(),
    topics: ["status"],
  });

  return token;
}
