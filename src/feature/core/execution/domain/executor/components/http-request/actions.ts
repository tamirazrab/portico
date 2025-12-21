"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { httpRequestChannel } from "@/bootstrap/integrations/inngest/channels/http-request";
import { inngest } from "@/bootstrap/integrations/inngest/client";

export type httpRequestToken = Realtime.Token<typeof httpRequestChannel, ["status"]>;

export async function fetchHttpRequestRealtimeToken(): Promise<httpRequestToken> {
 const token = await getSubscriptionToken(inngest ,{
    channel: httpRequestChannel(),
    topics: ["status"],
  });

  return token;
}
